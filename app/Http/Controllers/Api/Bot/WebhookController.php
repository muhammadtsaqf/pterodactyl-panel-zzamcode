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

        $user = User::where('phone', $phone)->first();

        if (!$user) {
            return response()->json(['reply' => "❌ Nomor WhatsApp Anda ({$phone}) belum terdaftar di panel.\n\nSilakan login ke panel dan isi nomor Anda (awali dengan 62 tanpa +) di halaman Account Overview pada kolom Profile Details."]);
        }

        $parts = explode(' ', $message);
        $command = $parts[0];
        $target = $parts[1] ?? null;

        if ($command === 'servers' || $command === 'list') {
            $servers = Server::where('owner_id', $user->id)->get();
            if ($servers->isEmpty()) {
                return response()->json(['reply' => "Anda belum memiliki server di panel."]);
            }

            $reply = "🚀 *Daftar Server Anda:*\n\n";
            foreach ($servers as $idx => $srv) {
                $no = $idx + 1;
                $reply .= "{$no}. *{$srv->name}*\nID: `{$srv->uuidShort}`\nNode: {$srv->node->name}\n\n";
            }
            $reply .= "Gunakan perintah `start <ID>`, `stop <ID>`, atau `restart <ID>` untuk mengontrol server Anda.";
            return response()->json(['reply' => $reply]);
        }

        if (in_array($command, ['start', 'stop', 'restart', 'kill'])) {
            if (!$target) {
                return response()->json(['reply' => "⚠️ Format salah. Contoh: `{$command} a1b2c3d4`"]);
            }

            $server = Server::where('uuidShort', 'like', $target . '%')
                            ->where('owner_id', $user->id)
                            ->first();

            if (!$server) {
                return response()->json(['reply' => "❌ Server dengan ID `{$target}` tidak ditemukan atau bukan milik Anda."]);
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

        return response()->json(['reply' => "🤖 *Menu Bot Panel*\n\n- `servers` : Lihat daftar server\n- `start <ID>` : Nyalakan server\n- `stop <ID>` : Matikan server\n- `restart <ID>` : Restart server\n- `kill <ID>` : Matikan paksa server"]);
    }
}
