<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Illuminate\Support\Str;

class DonateController extends Controller
{
    private $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * Render the donation page.
     */
    public function index(Request $request): View
    {
        return view('admin.donate.index', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Process the donation via Transaksikita.
     */
    public function process(Request $request): JsonResponse
    {
        $this->validate($request, [
            'amount' => 'required|numeric|min:1000',
            'message' => 'nullable|string|max:255',
        ]);

        $amount = (int) $request->input('amount');
        $supportMessage = $request->input('message', 'Thank you for your support!');
        
        $projectId = $this->settings->get('transaksikita::project_id');
        $publicKey = $this->settings->get('transaksikita::public_key');
        $secretKey = $this->settings->get('transaksikita::secret_key');

        if (empty($projectId) || empty($publicKey) || empty($secretKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Payment Gateway is not configured. Please contact the administrator.',
            ], 400);
        }

        $user = $request->user();
        $referenceId = 'DONATE-' . strtoupper(Str::random(10));

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
                'customerName' => trim($user->name_first . ' ' . $user->name_last),
                'description' => 'Donation: ' . $supportMessage,
                'expiredMinutes' => 30,
                'referenceId' => $referenceId,
            ]),
            CURLOPT_TIMEOUT => 15,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to payment gateway.',
            ], 500);
        }

        $decoded = json_decode($response, true);

        if ($httpCode === 200 && isset($decoded['success']) && $decoded['success']) {
            return response()->json([
                'success' => true,
                'paymentUrl' => $decoded['data']['paymentUrl'] ?? '',
                'referenceId' => $referenceId,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $decoded['message'] ?? 'Failed to generate payment.',
        ], 400);
    }
}
