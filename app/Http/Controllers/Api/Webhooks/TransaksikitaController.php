<?php

namespace Pterodactyl\Http\Controllers\Api\Webhooks;

use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\Transaction;
use Pterodactyl\Models\User;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class TransaksikitaController extends Controller
{
    private $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
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
            $transaction = Transaction::where('reference_id', $data['referenceId'])->first();

            if (!$transaction) {
                return response()->json(['error' => 'Transaction not found'], 404);
            }

            // Ensure idempotency: only process pending transactions
            if ($transaction->status === 'pending') {
                $transaction->status = 'success';
                $transaction->save();

                // Add balance to user
                $user = User::find($transaction->user_id);
                if ($user) {
                    $user->balance += $transaction->amount;
                    $user->save();
                }
            }
        }

        return response()->json(['received' => true], 200);
    }
}
