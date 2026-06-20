<?php

namespace Pterodactyl\Http\Controllers\Api\Bot;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonPowerRepository;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    public function __construct(private DaemonPowerRepository $powerRepository)
    {
    }

    public function handle(Request $request): JsonResponse
    {
        // Simple security check
        $secret = env('WA_BOT_SECRET', 'pterodactyl_wa_secret');
        if ($request->input('secret') !== $secret) {
            return response()->json(['reply' => 'Unauthorized access.'], 401);
        }

        $phone = $request->input('phone');
        $message = trim(strtolower($request->input('message')));
        
        if (!$phone || !$message) {
            return response()->json(['reply' => 'Invalid payload.'], 400);
        }

        // Clean incoming phone (remove +, -, spaces, etc)
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        
        // Generate alternate prefix (62 <-> 0)
        $alternatePhone = null;
        if (str_starts_with($cleanPhone, '62')) {
            $alternatePhone = '0' . substr($cleanPhone, 2);
        } elseif (str_starts_with($cleanPhone, '0')) {
            $alternatePhone = '62' . substr($cleanPhone, 1);
        }

        // Fetch users that might match
        $users = User::whereNotNull('phone')->get();
        $user = $users->first(function($u) use ($cleanPhone, $alternatePhone) {
            $dbPhone = preg_replace('/[^0-9]/', '', $u->phone);
            return $dbPhone === $cleanPhone || ($alternatePhone && $dbPhone === $alternatePhone);
        });

        if (!$user) {
            return response()->json(['reply' => "❌ Nomor WhatsApp Anda ({$cleanPhone}) belum terdaftar di panel.\n\nSilakan login ke panel dan update kolom Phone Number di Account Overview menjadi nomor Anda ini."]);
        }

        $parts = explode(' ', $message);
        $command = $parts[0];
        $target = trim(substr($message, strlen($command))) ?: null;

        if ($command === 'servers' || $command === 'list') {
            $servers = Server::with('node')->where('owner_id', $user->id)->get();
            if ($servers->isEmpty()) {
                return response()->json(['reply' => "Anda belum memiliki server di panel."]);
            }

            $reply = "🚀 *Daftar Server Anda:*\n\n";
            foreach ($servers as $idx => $srv) {
                $no = $idx + 1;
                $nodeName = $srv->node ? $srv->node->name : 'Unknown';
                $reply .= "{$no}. *{$srv->name}*\nID: `{$srv->uuidShort}`\nNode: {$nodeName}\n\n";
            }
            $reply .= "Gunakan perintah `start <Nama>`, `stop <Nama>`, atau `restart <Nama>` untuk mengontrol server Anda.";
            return response()->json(['reply' => $reply]);
        }

        if (in_array($command, ['start', 'stop', 'restart', 'kill'])) {
            if (!$target) {
                return response()->json(['reply' => "⚠️ Format salah. Contoh: `{$command} survival`"]);
            }

            $server = Server::where('name', 'like', '%' . $target . '%')
                            ->where('owner_id', $user->id)
                            ->first();

            if (!$server) {
                return response()->json(['reply' => "❌ Server dengan nama `{$target}` tidak ditemukan atau bukan milik Anda."]);
            }

            try {
                $this->powerRepository->setServer($server)->send($command);
                $action = [
                    'start' => 'menyalakan',
                    'stop' => 'mematikan',
                    'restart' => 'me-restart',
                    'kill' => 'menghentikan paksa'
                ][$command];

                return response()->json(['reply' => "✅ Perintah *{$command}* berhasil dikirim ke server *{$server->name}*."]);
            } catch (\Exception $e) {
                return response()->json(['reply' => "❌ Gagal mengirim perintah ke server. Node mungkin offline."]);
            }
        }

        return response()->json(['reply' => "🤖 *Menu Bot Panel*\n\n- `servers` : Lihat daftar server\n- `start <Nama>` : Nyalakan server\n- `stop <Nama>` : Matikan server\n- `restart <Nama>` : Restart server\n- `kill <Nama>` : Matikan paksa server"]);
    }
}
