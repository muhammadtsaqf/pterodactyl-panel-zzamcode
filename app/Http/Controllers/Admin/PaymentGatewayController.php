<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Prologue\Alerts\AlertsMessageBag;

class PaymentGatewayController extends Controller
{
    /**
     * @var \Pterodactyl\Contracts\Repository\SettingsRepositoryInterface
     */
    private $settings;

    /**
     * @var \Prologue\Alerts\AlertsMessageBag
     */
    private $alert;

    /**
     * PaymentGatewayController constructor.
     */
    public function __construct(
        SettingsRepositoryInterface $settings,
        AlertsMessageBag $alert
    ) {
        $this->settings = $settings;
        $this->alert = $alert;
    }

    /**
     * Render the payment gateway settings interface.
     */
    public function index(): View
    {
        return view('admin.payment_gateway.index', [
            'project_id' => $this->settings->get('transaksikita::project_id', ''),
            'public_key' => $this->settings->get('transaksikita::public_key', ''),
            'secret_key' => $this->settings->get('transaksikita::secret_key', ''),
        ]);
    }

    /**
     * Handle updating the settings.
     */
    public function update(Request $request)
    {
        $this->validate($request, [
            'project_id' => 'required|string',
            'public_key' => 'required|string',
            'secret_key' => 'required|string',
        ]);

        $this->settings->set('transaksikita::project_id', $request->input('project_id'));
        $this->settings->set('transaksikita::public_key', $request->input('public_key'));
        $this->settings->set('transaksikita::secret_key', $request->input('secret_key'));

        $this->alert->success('Payment Gateway settings have been updated successfully.')->flash();

        return redirect()->route('admin.payment_gateway');
    }

    /**
     * Handle pinging the Transaksikita API to verify credentials.
     */
    public function ping(Request $request)
    {
        $projectId = $this->settings->get('transaksikita::project_id');
        $publicKey = $this->settings->get('transaksikita::public_key');
        $secretKey = $this->settings->get('transaksikita::secret_key');

        if (empty($projectId) || empty($publicKey) || empty($secretKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API credentials are not fully configured. Please save your settings first.',
            ], 400);
        }

        $ch = curl_init('https://transaksikita.com/api/v1/ping');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'X-PROJECT-ID: ' . $projectId,
                'X-PUBLIC-KEY: ' . $publicKey,
                'Authorization: Bearer ' . $secretKey,
            ],
            CURLOPT_TIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to Transaksikita API.',
            ], 500);
        }

        $decoded = json_decode($response, true);

        if ($httpCode === 200 && isset($decoded['success']) && $decoded['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Connection successful! Project: ' . ($decoded['data']['projectName'] ?? 'Unknown'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $decoded['message'] ?? 'Invalid credentials or API error.',
        ], 400);
    }
}
