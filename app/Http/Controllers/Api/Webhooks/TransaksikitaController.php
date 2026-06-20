<?php

namespace Pterodactyl\Http\Controllers\Api\Webhooks;

use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\StoreOrder;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Services\Servers\ServerCreationService;
use Pterodactyl\Services\WhatsApp\WhatsAppNotifierService;

class TransaksikitaController extends Controller
{
    private $settings;
    private $serverCreationService;
    private $whatsAppNotifier;

    public function __construct(SettingsRepositoryInterface $settings, ServerCreationService $serverCreationService, WhatsAppNotifierService $whatsAppNotifier)
    {
        $this->settings = $settings;
        $this->serverCreationService = $serverCreationService;
        $this->whatsAppNotifier = $whatsAppNotifier;
    }

    /**
     * Handle the webhook callback from Transaksikita.
     */
    public function handle(Request $request)
    {
        $rawBody = $request->getContent();
        $signature = $request->header('X-CALLBACK-SIGNATURE') ?? $request->header('HTTP_X_CALLBACK_SIGNATURE') ?? '';
        $secretKey = $this->settings->get('transaksikita::secret_key');

        if (empty($secretKey)) {
            return response()->json(['error' => 'Webhook not configured'], 400);
        }

        // Verify the signature
        $expected = hash_hmac('sha256', $rawBody, $secretKey);

        if (!hash_equals($expected, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $data = json_decode($rawBody, true);

        if (!$data || !isset($data['referenceId']) || !isset($data['status'])) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        if ($data['status'] === 'success') {
            if (str_starts_with($data['referenceId'], 'STORE-')) {
                return $this->handleStoreOrder($data);
            }
        }

        return response()->json(['received' => true], 200);
    }

    private function handleStoreOrder($data)
    {
        $order = StoreOrder::where('reference_id', $data['referenceId'])->first();

        if (!$order) {
            return response()->json(['error' => 'Store Order not found'], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json(['received' => true], 200);
        }

        $order->status = 'paid';
        $order->save();

        if ($order->type === 'purchase') {
            try {
                $server = $this->serverCreationService->handle($order->data);
                
                $server->store_renewal_cost = $order->data['store_renewal_cost'] ?? $order->amount;
                $server->store_renewal_duration = 1;
                
                $durationValue = $order->data['store_duration_value'] ?? 1;
                if ($durationValue === '7days') {
                    $server->store_expires_at = now()->addDays(7);
                } else {
                    $server->store_expires_at = now()->addMonths((int)$durationValue);
                }
                $server->save();

                $order->server_id = $server->id;
                $order->save();

                // Send WhatsApp notification
                $user = \Pterodactyl\Models\User::find($order->user_id);
                if ($user) {
                    $durationValue = $order->data['store_duration_value'] ?? 1;
                    $durationLabel = $durationValue === '7days' ? '7 Hari' : $durationValue . ' Bulan';
                    $message = "🎉 *PEMBELIAN BERHASIL*\n\nHalo {$user->name_first}!\nServer Minecraft Anda ({$server->name}) durasi {$durationLabel} telah berhasil dibuat.\n\nSilakan cek panel untuk login dan mengelola server Anda.";
                    $this->whatsAppNotifier->send($user, $message);
                }
            } catch (\Exception $e) {
                \Log::error('Failed to provision server for Order ' . $order->id . ': ' . $e->getMessage());
            }
        } elseif ($order->type === 'renew') {
            $server = \Pterodactyl\Models\Server::find($order->server_id);
            if ($server) {
                $durationValue = $order->data['duration'] ?? 1;
                
                $addMethod = $durationValue === '7days' ? 'addDays' : 'addMonths';
                $addValue = $durationValue === '7days' ? 7 : (int)$durationValue;

                if ($server->store_expires_at && $server->store_expires_at->isFuture()) {
                    $server->store_expires_at = $server->store_expires_at->$addMethod($addValue);
                } else {
                    $server->store_expires_at = now()->$addMethod($addValue);
                }

                if ($server->status === \Pterodactyl\Models\Server::STATUS_SUSPENDED) {
                    $server->status = null;
                }
                
                $server->save();

                // Send WhatsApp notification
                $user = \Pterodactyl\Models\User::find($order->user_id);
                if ($user) {
                    $durationValue = $order->data['duration'] ?? 1;
                    $durationLabel = $durationValue === '7days' ? '7 Hari' : $durationValue . ' Bulan';
                    $message = "✅ *PERPANJANGAN BERHASIL*\n\nHalo {$user->name_first}!\nServer Anda ({$server->name}) berhasil diperpanjang selama {$durationLabel}.\n\nTerima kasih telah menggunakan layanan kami.";
                    $this->whatsAppNotifier->send($user, $message);
                }
            }
        }

        return response()->json(['received' => true], 200);
    }
}
