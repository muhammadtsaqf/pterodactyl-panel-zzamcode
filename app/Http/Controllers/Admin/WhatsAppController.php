<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class WhatsAppController extends Controller
{
    private $botUrl = 'http://127.0.0.1:3001';

    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    /**
     * Return the admin index view for WhatsApp Bot configuration.
     */
    public function index(): View
    {
        return view('admin.whatsapp.index', [
            'owner_number' => $this->settings->get('wa_bot:owner_number', ''),
            'group_jid' => $this->settings->get('wa_bot:group_jid', ''),
            'group_name' => $this->settings->get('wa_bot:group_name', ''),
        ]);
    }

    public function saveSettings(Request $request): JsonResponse
    {
        $this->settings->set('wa_bot:owner_number', preg_replace('/[^0-9]/', '', $request->input('owner_number', '')));
        return response()->json(['success' => true]);
    }

    public function leaveGroup(): JsonResponse
    {
        try {
            $response = Http::post("{$this->botUrl}/api/leave-group", [
                'groupId' => $this->settings->get('wa_bot:group_jid', '')
            ]);
            
            $this->settings->forget('wa_bot:group_jid');
            $this->settings->forget('wa_bot:group_name');

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Cannot connect to bot service.']);
        }
    }

    public function status(): JsonResponse
    {
        try {
            $response = Http::timeout(3)->get("{$this->botUrl}/api/status");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['status' => 'offline', 'error' => true]);
        }
    }

    public function start(Request $request): JsonResponse
    {
        try {
            $response = Http::post("{$this->botUrl}/api/start", [
                'number' => $request->input('number')
            ]);
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Cannot connect to bot service. Make sure it is running via PM2.']);
        }
    }

    public function stop(): JsonResponse
    {
        try {
            $response = Http::post("{$this->botUrl}/api/stop");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Cannot connect to bot service.']);
        }
    }

    public function clear(): JsonResponse
    {
        try {
            $response = Http::post("{$this->botUrl}/api/clear");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Cannot connect to bot service.']);
        }
    }

    public function logs(): JsonResponse
    {
        try {
            $response = Http::timeout(3)->get("{$this->botUrl}/api/logs");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'logs' => ['[SYSTEM] Bot service is currently offline.']]);
        }
    }
}
