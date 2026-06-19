<?php

namespace Pterodactyl\Http\Controllers\Api\Webhooks;

use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\StoreOrder;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Services\Servers\ServerCreationService;

class TransaksikitaController extends Controller
{
    private $settings;
    private $serverCreationService;

    public function __construct(SettingsRepositoryInterface $settings, ServerCreationService $serverCreationService)
    {
        $this->settings = $settings;
        $this->serverCreationService = $serverCreationService;
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
                
                // Set the store billing info
                $server->store_renewal_cost = $order->amount;
                $server->store_renewal_duration = $order->data['store_duration_months'] ?? 1;
                $server->store_expires_at = now()->addMonths($server->store_renewal_duration);
                $server->save();

                $order->server_id = $server->id;
                $order->save();
            } catch (\Exception $e) {
                \Log::error('Failed to provision server for Order ' . $order->id . ': ' . $e->getMessage());
            }
        } elseif ($order->type === 'renew') {
            $server = \Pterodactyl\Models\Server::find($order->server_id);
            if ($server) {
                $duration = $order->data['duration'] ?? 1;
                
                if ($server->store_expires_at && $server->store_expires_at->isFuture()) {
                    $server->store_expires_at = $server->store_expires_at->addMonths($duration);
                } else {
                    $server->store_expires_at = now()->addMonths($duration);
                }

                if ($server->status === \Pterodactyl\Models\Server::STATUS_SUSPENDED) {
                    $server->status = null;
                }
                
                $server->save();
            }
        }

        return response()->json(['received' => true], 200);
    }
}
