<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\Request;
use Pterodactyl\Models\Transaction;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Illuminate\Support\Str;

class TopupController extends ClientApiController
{
    private $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        parent::__construct();
        $this->settings = $settings;
    }

    /**
     * Create a new payment via Transaksikita.
     */
    public function createPayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:500',
        ]);

        $user = $request->user();
        $amount = $request->input('amount');
        
        $projectId = $this->settings->get('transaksikita::project_id');
        $publicKey = $this->settings->get('transaksikita::public_key');
        $secretKey = $this->settings->get('transaksikita::secret_key');

        if (empty($projectId) || empty($publicKey) || empty($secretKey)) {
            return response()->json(['error' => 'Payment Gateway is not fully configured.'], 500);
        }

        // Generate a unique reference ID
        $referenceId = 'ORDER-' . $user->id . '-' . time() . '-' . Str::random(5);

        // Create the pending transaction in our database
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'reference_id' => $referenceId,
            'amount' => $amount,
            'status' => 'pending',
        ]);

        // Hit the Transaksikita API
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
                'amount' => (int) $amount,
                'customerName' => $user->name_first . ' ' . $user->name_last,
                'description' => 'Topup Balance for ' . $user->username,
                'expiredMinutes' => 10,
                'referenceId' => $referenceId,
            ]),
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $decoded = json_decode($response, true);

        if ($httpCode === 200 && isset($decoded['success']) && $decoded['success']) {
            return response()->json([
                'success' => true,
                'data' => [
                    'paymentId' => $decoded['data']['paymentId'],
                    'referenceId' => $referenceId,
                ]
            ]);
        }

        // Log or handle error if needed
        $transaction->update(['status' => 'failed']);

        return response()->json([
            'success' => false,
            'error' => $decoded['message'] ?? 'Failed to create payment with gateway.'
        ], 400);
    }
}
