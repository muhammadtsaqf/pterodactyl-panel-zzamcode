<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;

class WhatsAppController extends Controller
{
    private $botUrl = 'http://127.0.0.1:3001';

    /**
     * Return the admin index view for WhatsApp Bot configuration.
     */
    public function index(): View
    {
        return view('admin.whatsapp.index');
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
