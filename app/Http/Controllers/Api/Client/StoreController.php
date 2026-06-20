<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Pterodactyl\Models\User;
use Illuminate\Http\Request;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\StoreOrder;
use Pterodactyl\Models\StoreDiscount;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Services\Deployment\AllocationSelectionService;
use Pterodactyl\Services\WhatsApp\WhatsAppNotifierService;
use Illuminate\Support\Str;

class StoreController extends ClientApiController
{
    public function __construct(
        private SettingsRepositoryInterface $settings,
        private AllocationSelectionService $allocationSelectionService,
        private WhatsAppNotifierService $whatsAppNotifier
    ) {
        parent::__construct();
    }

    public function info()
    {
        $enabled = $this->settings->get('settings::store:enabled', 1) == 1;
        $prices = [
            'cpu' => (int)$this->settings->get('settings::store:price:cpu', 1000),
            'ram' => (int)$this->settings->get('settings::store:price:ram', 5000),
            'disk' => (int)$this->settings->get('settings::store:price:disk', 2000),
            'database' => (int)$this->settings->get('settings::store:price:database', 1000),
            'backup' => (int)$this->settings->get('settings::store:price:backup', 1000),
            'port' => (int)$this->settings->get('settings::store:price:port', 500),
        ];

        $nests = Nest::with('eggs')->get()->map(function($nest) {
            return [
                'id' => $nest->id,
                'name' => $nest->name,
                'eggs' => $nest->eggs->map(function($egg) {
                    return [
                        'id' => $egg->id,
                        'name' => $egg->name,
                        'description' => $egg->description,
                    ];
                })->values()
            ];
        })->values();

        return [
            'enabled' => $enabled,
            'prices' => $prices,
            'nests' => $nests,
        ];
    }

    public function validateDiscount(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $discount = StoreDiscount::where('code', strtoupper($request->input('code')))->first();

        if (!$discount || !$discount->isValid()) {
            return response()->json(['error' => 'Invalid or expired discount code.'], 400);
        }

        return response()->json([
            'success' => true,
            'discount_percent' => $discount->discount_percent
        ]);
    }

    private function generatePayment(User $user, int $amount, string $referenceId, string $description)
    {
        $projectId = $this->settings->get('transaksikita::project_id');
        $publicKey = $this->settings->get('transaksikita::public_key');
        $secretKey = $this->settings->get('transaksikita::secret_key');

        if (empty($projectId) || empty($publicKey) || empty($secretKey)) {
            throw new \Exception('Payment Gateway is not fully configured.');
        }

        $ch = curl_init('https://transaksikita.com/api/v1/create-payment');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'X-PROJECT-ID: ' . $projectId,
                'X-PUBLIC-KEY: ' . $publicKey,
                'Authorization: Bearer ' . $secretKey,
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'amount' => $amount,
                'customerName' => $user->name_first . ' ' . $user->name_last,
                'description' => $description,
                'expiredMinutes' => 10,
                'referenceId' => $referenceId,
            ]),
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $decoded = json_decode($response, true);

        if ($httpCode === 200 && isset($decoded['success']) && $decoded['success']) {
            return $decoded['data']['paymentId'];
        }

        throw new \Exception($decoded['message'] ?? 'Failed to create payment with gateway.');
    }

    public function purchase(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if (empty($user->phone) || empty($user->address_1) || empty($user->city) || empty($user->state) || empty($user->zip) || empty($user->country)) {
            return response()->json(['error' => 'Silakan lengkapi informasi profil Anda (No. HP, Alamat, Kota, dll) di menu Account sebelum melakukan pembelian.'], 403);
        }

        if ($this->settings->get('settings::store:enabled', 1) == 0) {
            return response()->json(['error' => 'Store is currently disabled.'], 403);
        }

        $nodeId = $this->settings->get('settings::store:node_id');
        if (!$nodeId) {
            return response()->json(['error' => 'Store is not properly configured. No default node selected.'], 500);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:1|max:255',
            'egg_id' => 'required|exists:eggs,id',
            'cpu' => 'required|integer|min:10',
            'ram' => 'required|integer|min:512',
            'disk' => 'required|integer|min:512',
            'databases' => 'required|integer|min:0',
            'backups' => 'required|integer|min:0',
            'ports' => 'required|integer|min:0',
            'duration' => 'required|in:7days,1,3,12',
            'discount_code' => 'nullable|string',
        ]);

        $egg = Egg::with('variables')->findOrFail($validated['egg_id']);

        $priceCpu = (int)$this->settings->get('settings::store:price:cpu', 1000);
        $priceRam = (int)$this->settings->get('settings::store:price:ram', 5000);
        $priceDisk = (int)$this->settings->get('settings::store:price:disk', 2000);
        $priceDb = (int)$this->settings->get('settings::store:price:database', 1000);
        $priceBackup = (int)$this->settings->get('settings::store:price:backup', 1000);
        $pricePort = (int)$this->settings->get('settings::store:price:port', 500);

        // Calculate total cost
        $monthlyCost = 0;
        $monthlyCost += ($validated['cpu'] / 10) * $priceCpu;
        $monthlyCost += ($validated['ram'] / 1024) * $priceRam;
        $monthlyCost += ($validated['disk'] / 1024) * $priceDisk;
        $monthlyCost += $validated['databases'] * $priceDb;
        $monthlyCost += $validated['backups'] * $priceBackup;
        $monthlyCost += $validated['ports'] * $pricePort;

        $multiplier = $validated['duration'] === '7days' ? (7 / 30) : (int)$validated['duration'];
        $originalTotalCost = round($monthlyCost * $multiplier);
        $totalCost = $originalTotalCost;

        $discountModel = null;
        if (!empty($validated['discount_code'])) {
            $discountModel = StoreDiscount::where('code', strtoupper($validated['discount_code']))->first();
            if ($discountModel && $discountModel->isValid()) {
                $discountAmount = $totalCost * ($discountModel->discount_percent / 100);
                $totalCost = max(0, $totalCost - $discountAmount);
            } else {
                return response()->json(['error' => 'Invalid or expired discount code.'], 400);
            }
        }

        // Check if node has allocations (just a quick check before payment)
        try {
            $allocation = $this->allocationSelectionService->setNodes([$nodeId])->handle();
        } catch (\Exception $e) {
            return response()->json(['error' => 'No available ports on the selected node. Please contact administrator.'], 500);
        }

        // Environment variables defaults
        $environment = [];
        foreach ($egg->variables as $variable) {
            $environment[$variable->env_variable] = $variable->default_value;
        }

        $data = [
            'name' => $validated['name'],
            'owner_id' => $user->id,
            'egg_id' => $egg->id,
            'nest_id' => $egg->nest_id,
            'node_id' => $nodeId,
            'allocation_id' => $allocation->id,
            'allocation_limit' => $validated['ports'] + 1,
            'backup_limit' => $validated['backups'],
            'database_limit' => $validated['databases'],
            'environment' => $environment,
            'memory' => $validated['ram'],
            'disk' => $validated['disk'],
            'cpu' => $validated['cpu'],
            'swap' => 0,
            'io' => 500,
            'image' => $egg->docker_images[0] ?? $egg->docker_image ?? 'ghcr.io/pterodactyl/yolks:java_17',
            'startup' => $egg->startup,
            'start_on_completion' => true,
            'store_duration_value' => $validated['duration'], // passed to webhook
            'store_renewal_cost' => $monthlyCost, // We store the base MONTHLY cost for future renewals
        ];

        $referenceId = 'STORE-' . $user->id . '-' . time() . '-' . Str::random(5);

        if ($totalCost <= 0) {
            // Free order due to discount
            $paymentId = 'FREE-' . Str::random(10);
            $order = StoreOrder::create([
                'user_id' => $user->id,
                'type' => 'purchase',
                'data' => $data,
                'amount' => 0,
                'reference_id' => $referenceId,
                'payment_id' => $paymentId,
                'status' => 'paid',
            ]);

            if ($discountModel) {
                $discountModel->increment('uses');
            }

            try {
                $serverCreationService = app(\Pterodactyl\Services\Servers\ServerCreationService::class);
                $server = $serverCreationService->handle($data);
                
                $server->store_renewal_cost = $monthlyCost;
                $server->store_renewal_duration = 1;
                
                if ($validated['duration'] === '7days') {
                    $server->store_expires_at = now()->addDays(7);
                } else {
                    $server->store_expires_at = now()->addMonths((int)$validated['duration']);
                }
                $server->save();

                $order->server_id = $server->id;
                $order->save();

                // Send WhatsApp notification
                $durationValue = $validated['duration'] ?? 1;
                $durationLabel = $durationValue === '7days' ? '7 Hari' : $durationValue . ' Bulan';
                $message = "🎉 *PEMBELIAN BERHASIL (GRATIS)*\n\nHalo {$user->name_first}!\nServer Minecraft Anda ({$server->name}) durasi {$durationLabel} telah berhasil dibuat.\n\nSilakan cek panel untuk login dan mengelola server Anda.";
                $this->whatsAppNotifier->send($user, $message);
            } catch (\Exception $e) {
                \Log::error('Failed to provision free server: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'paymentId' => 'FREE',
                    'referenceId' => $referenceId,
                ]
            ]);
        }

        try {
            $durationLabel = $validated['duration'] === '7days' ? '7 Days' : $validated['duration'] . ' Months';
            $paymentId = $this->generatePayment($user, $totalCost, $referenceId, 'Purchase Server (' . $durationLabel . ')');

            StoreOrder::create([
                'user_id' => $user->id,
                'type' => 'purchase',
                'data' => $data,
                'amount' => $totalCost,
                'reference_id' => $referenceId,
                'payment_id' => $paymentId,
                'status' => 'pending',
            ]);

            if ($discountModel) {
                $discountModel->increment('uses');
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'paymentId' => $paymentId,
                    'referenceId' => $referenceId,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function renew(Request $request, Server $server)
    {
        /** @var User $user */
        $user = $request->user();

        if (empty($user->phone) || empty($user->address_1) || empty($user->city) || empty($user->state) || empty($user->zip) || empty($user->country)) {
            return response()->json(['error' => 'Silakan lengkapi informasi profil Anda (No. HP, Alamat, Kota, dll) di menu Account sebelum melakukan perpanjangan.'], 403);
        }

        $validated = $request->validate([
            'duration' => 'required|in:7days,1,3,12',
            'discount_code' => 'nullable|string',
        ]);

        if ($server->owner_id !== $user->id) {
            return response()->json(['error' => 'You do not own this server.'], 403);
        }

        if (!$server->store_renewal_cost) {
            return response()->json(['error' => 'This server cannot be renewed because it was not purchased from the store.'], 400);
        }

        // Base renewal cost is the original monthly cost
        $originalMonthlyCost = $server->store_renewal_cost / ($server->store_renewal_duration ?: 1);
        $multiplier = $validated['duration'] === '7days' ? (7 / 30) : (int)$validated['duration'];
        $totalCost = round($originalMonthlyCost * $multiplier);

        $discountModel = null;
        if (!empty($validated['discount_code'])) {
            $discountModel = StoreDiscount::where('code', strtoupper($validated['discount_code']))->first();
            if ($discountModel && $discountModel->isValid()) {
                $discountAmount = $totalCost * ($discountModel->discount_percent / 100);
                $totalCost = max(0, $totalCost - $discountAmount);
            } else {
                return response()->json(['error' => 'Invalid or expired discount code.'], 400);
            }
        }

        $referenceId = 'STORE-RENEW-' . $server->id . '-' . time() . '-' . Str::random(5);

        if ($totalCost <= 0) {
            $paymentId = 'FREE-' . Str::random(10);
            StoreOrder::create([
                'user_id' => $user->id,
                'type' => 'renew',
                'server_id' => $server->id,
                'data' => ['duration' => $validated['duration']],
                'amount' => 0,
                'reference_id' => $referenceId,
                'payment_id' => $paymentId,
                'status' => 'paid',
            ]);

            if ($discountModel) {
                $discountModel->increment('uses');
            }

            $addMethod = $validated['duration'] === '7days' ? 'addDays' : 'addMonths';
            $addValue = $validated['duration'] === '7days' ? 7 : (int)$validated['duration'];

            if ($server->store_expires_at && $server->store_expires_at->isFuture()) {
                $server->store_expires_at = $server->store_expires_at->$addMethod($addValue);
            } else {
                $server->store_expires_at = now()->$addMethod($addValue);
            }

            if ($server->status === Server::STATUS_SUSPENDED) {
                $server->status = null;
            }
            $server->save();

            // Send WhatsApp notification
            $durationValue = $validated['duration'] ?? 1;
            $durationLabel = $durationValue === '7days' ? '7 Hari' : $durationValue . ' Bulan';
            $message = "✅ *PERPANJANGAN BERHASIL (GRATIS)*\n\nHalo {$user->name_first}!\nServer Anda ({$server->name}) berhasil diperpanjang selama {$durationLabel}.\n\nTerima kasih telah menggunakan layanan kami.";
            $this->whatsAppNotifier->send($user, $message);

            return response()->json([
                'success' => true,
                'data' => [
                    'paymentId' => 'FREE',
                    'referenceId' => $referenceId,
                ]
            ]);
        }

        try {
            $durationLabel = $validated['duration'] === '7days' ? '7 Days' : $validated['duration'] . ' Months';
            $paymentId = $this->generatePayment($user, $totalCost, $referenceId, 'Renew Server ' . $server->uuidShort . ' (' . $durationLabel . ')');

            StoreOrder::create([
                'user_id' => $user->id,
                'type' => 'renew',
                'server_id' => $server->id,
                'data' => ['duration' => $validated['duration']],
                'amount' => $totalCost,
                'reference_id' => $referenceId,
                'payment_id' => $paymentId,
                'status' => 'pending',
            ]);

            if ($discountModel) {
                $discountModel->increment('uses');
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'paymentId' => $paymentId,
                    'referenceId' => $referenceId,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getOrderStatus(Request $request, $referenceId)
    {
        $order = StoreOrder::where('reference_id', $referenceId)->where('user_id', $request->user()->id)->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        return response()->json([
            'status' => $order->status,
        ]);
    }
}
