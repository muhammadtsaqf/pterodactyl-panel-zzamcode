<?php

namespace Pterodactyl\Http\Controllers\Api\Bot;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonPowerRepository;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Support\Str;

use Pterodactyl\Models\Node;
use Pterodactyl\Models\StoreDiscount;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class WebhookController extends Controller
{
    public function __construct(
        private DaemonPowerRepository $powerRepository,
        private SettingsRepositoryInterface $settings
    ) {
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

        $ownerNumber = $this->settings->get('wa_bot:owner_number', '');
        $isOwner = ($ownerNumber !== '' && $ownerNumber === $cleanPhone);

        // Enforce Group-Only mode
        $remoteJid = $request->input('remoteJid', '');
        $groupJid = $this->settings->get('wa_bot:group_jid', '');
        $isGroupMessage = str_contains($remoteJid, '@g.us');
        
        // Hanya owner yang bisa private
        if (!$isGroupMessage && !$isOwner) {
            $parts = explode(' ', $message);
            $command = $parts[0] ?? '';
            if (in_array($command, ['.mysrv', 'servers', 'list', 'start', 'stop', 'restart', 'kill', 'help', 'menu'])) {
                return response()->json(['reply' => "⚠️ Bot saat ini hanya melayani perintah di dalam Grup resmi.\nAnda tidak dapat menggunakannya di *Private Chat*."]);
            }
            return response()->json(['success' => true]); // Ignore silently
        }
        
        // Jika sudah gabung ke satu grup, abaikan grup lain
        if ($isGroupMessage && $groupJid !== '' && $remoteJid !== $groupJid) {
            return response()->json(['success' => true]);
        }

        $parts = explode(' ', $message);
        $command = $parts[0];
        $target = trim(substr($message, strlen($command))) ?: null;

        if ($command === '.mysrv' || $command === 'servers' || $command === 'list') {
            if ($target && in_array(explode(' ', $target)[0], ['start', 'stop', 'restart', 'kill', 'reinstall', 'createbackup', 'backup'])) {
                $subArgs = explode(' ', $target);
                $subCommand = $subArgs[0];
                $serverId = $subArgs[1] ?? null;

                if (!$serverId) {
                    return response()->json(['reply' => "⚠️ Format salah. Contoh: `.mysrv {$subCommand} 453`"]);
                }

                $server = Server::where('id', $serverId)
                                ->where('owner_id', $user->id)
                                ->first();

                if (!$server) {
                    return response()->json(['reply' => "❌ Server dengan ID `{$serverId}` tidak ditemukan atau bukan milik Anda."]);
                }

                try {
                    if (in_array($subCommand, ['start', 'stop', 'restart', 'kill'])) {
                        $this->powerRepository->setServer($server)->send($subCommand);
                        return response()->json(['reply' => "✅ Perintah *{$subCommand}* berhasil dikirim ke server *{$server->name}*."]);
                    } elseif ($subCommand === 'reinstall') {
                        app(\Pterodactyl\Repositories\Eloquent\ServerRepository::class)->update($server->id, ['status' => Server::STATUS_INSTALLING]);
                        return response()->json(['reply' => "✅ Proses *reinstall* untuk server *{$server->name}* telah dimulai. Server tidak dapat diakses untuk sementara waktu."]);
                    } elseif ($subCommand === 'createbackup') {
                        return response()->json(['reply' => "⏳ Fitur create backup via WA segera hadir."]);
                    } elseif ($subCommand === 'backup') {
                        return response()->json(['reply' => "⏳ Fitur send backup via WA segera hadir."]);
                    }
                } catch (\Exception $e) {
                    return response()->json(['reply' => "❌ Gagal mengirim perintah ke server. Error: " . $e->getMessage()]);
                }
            }

            $servers = Server::with('node')->where('owner_id', $user->id)->get();
            if ($servers->isEmpty()) {
                return response()->json(['reply' => "Anda belum memiliki server di panel."]);
            }

            $reply = "⚙️ OPTIONS CONTROL SERVER\n\n" .
                     "1. Start: .mysrv start [idserver]\n" .
                     "2. Restart: .mysrv restart [idserver]\n" .
                     "3. Stop: .mysrv stop [idserver]\n" .
                     "4. Reinstall: .mysrv reinstall [idserver]\n" .
                     "5. Create Backup: .mysrv createbackup [idserver]\n" .
                     "6. Send Backup: .mysrv backup [idserver]\n\n" .
                     "📋 ＤＡＦＴＡＲ ＳＥＲＶＥＲ\n\n";

            foreach ($servers as $idx => $srv) {
                $expired = "Permanen";
                if (isset($srv->store_expires_at) && $srv->store_expires_at) {
                    $expired = \Carbon\Carbon::parse($srv->store_expires_at)->translatedFormat('d F Y');
                }
                
                $status = "Aktif";
                if ($srv->isSuspended()) $status = "Suspended";
                elseif (!$srv->isInstalled()) $status = "Installing";

                $backupStatus = ($srv->backup_limit > 0) ? "Aktif" : "Nonaktif";

                $reply .= "📌 ID Server: {$srv->id}\n" .
                          "📛 Nama: {$srv->name}\n" .
                          "⏳ Expired: {$expired}\n" .
                          "✅ Status: {$status}\n" .
                          "🔄 Backup: {$backupStatus}\n\n";
            }
            $reply .= "📊 Total: {$servers->count()} server";
            return response()->json(['reply' => $reply]);
        }

        if ($command === 'help' || $command === 'menu') {
            $reply = "🤖 *Pterodactyl WhatsApp Bot*\n\n" .
                     "Perintah yang tersedia:\n" .
                     "• `servers` / `list` - Melihat daftar server Anda\n" .
                     "• `start <Nama>` - Menyalakan server\n" .
                     "• `stop <Nama>` - Mematikan server\n" .
                     "• `restart <Nama>` - Me-restart server\n" .
                     "• `kill <Nama>` - Menghentikan paksa server\n\n" .
                     "Bot ini dibuat oleh zzamcode.";
            return response()->json(['reply' => $reply]);
        }

        // =====================================
        // BOT OWNER COMMANDS
        // =====================================

        if (in_array($command, ['menuowner', 'creatediscount', 'join', 'info', 'broadcast', 'restartbot'])) {
            if (!$isOwner) {
                return response()->json(['reply' => "❌ Anda tidak memiliki izin untuk menggunakan perintah ini."]);
            }

            if ($command === 'menuowner') {
                $reply = "👑 *MENU OWNER BOT*\n\n" .
                         "• `creatediscount <code> <percent> <max_uses>` - Buat diskon store\n" .
                         "• `join <link_grup>` - Memasukkan bot ke grup (maksimal 1 grup)\n" .
                         "• `info` - Lihat status panel (User, Server, Node)\n" .
                         "• `broadcast <pesan>` - Kirim pesan massal ke seluruh user\n" .
                         "• `restartbot` - Me-restart layanan PM2 bot\n";
                return response()->json(['reply' => $reply]);
            }

            if ($command === 'creatediscount') {
                $args = explode(' ', $target);
                if (count($args) < 3) {
                    return response()->json(['reply' => "⚠️ Format salah. Contoh: `creatediscount MERDEKA 50 100`"]);
                }
                
                $code = strtoupper($args[0]);
                $percent = (int)$args[1];
                $maxUses = (int)$args[2];

                StoreDiscount::create([
                    'code' => $code,
                    'discount_percent' => $percent,
                    'max_uses' => $maxUses,
                    'uses' => 0
                ]);

                // Broadcast to group
                $broadcastMsg = "🎉 *KODE DISKON BARU!*\n\nAda diskon *{$percent}%* untuk pembelian server di Store!\n\n👉 Kode: *{$code}*\n⏳ Kuota: {$maxUses}x pemakaian\n\nBuruan pakai sebelum kehabisan!";
                app(\Pterodactyl\Services\WhatsApp\WhatsAppNotifierService::class)->sendToGroup($broadcastMsg);

                return response()->json(['reply' => "✅ Diskon berhasil dibuat dan diumumkan ke grup!\n\nKode: *{$code}*\nDiskon: {$percent}%\nMaks Kuota: {$maxUses}x pakai"]);
            }

            if ($command === 'join') {
                if (!$target || !str_contains($target, 'chat.whatsapp.com/')) {
                    return response()->json(['reply' => "⚠️ Format salah. Kirimkan link invite WhatsApp grup."]);
                }

                $currentGroup = $this->settings->get('wa_bot:group_jid', '');
                if ($currentGroup !== '') {
                    return response()->json(['reply' => "❌ Bot sudah berada di dalam grup lain.\nBot hanya dapat join di 1 grup saja. Silakan keluarkan bot dari grup saat ini melalui Admin Panel terlebih dahulu."]);
                }

                $inviteCode = explode('chat.whatsapp.com/', $target)[1];
                $inviteCode = explode(' ', $inviteCode)[0]; // get the code only

                return response()->json([
                    'reply' => "⏳ Sedang memproses untuk masuk ke grup...",
                    'action' => 'join_group',
                    'invite_code' => $inviteCode
                ]);
            }

            if ($command === 'info') {
                $userCount = User::count();
                $serverCount = Server::count();
                $nodeCount = Node::count();

                $reply = "📊 *STATISTIK PANEL*\n\n" .
                         "👥 Total User: {$userCount}\n" .
                         "🎮 Total Server: {$serverCount}\n" .
                         "🖥️ Total Node: {$nodeCount}\n";
                return response()->json(['reply' => $reply]);
            }

            if ($command === 'broadcast') {
                if (!$target) {
                    return response()->json(['reply' => "⚠️ Format salah. Contoh: `broadcast Halo semua ada diskon!`"]);
                }

                // Get all valid user phones
                $phones = User::whereNotNull('phone')
                    ->where('phone', '!=', '')
                    ->pluck('phone')
                    ->map(function($p) {
                        $c = preg_replace('/[^0-9]/', '', $p);
                        if (str_starts_with($c, '0')) {
                            $c = '62' . substr($c, 1);
                        }
                        return $c;
                    })
                    ->unique()
                    ->values()
                    ->toArray();

                if (empty($phones)) {
                    return response()->json(['reply' => "❌ Tidak ada user yang memiliki nomor telepon valid."]);
                }

                return response()->json([
                    'reply' => "⏳ Sedang mengirim pesan broadcast ke " . count($phones) . " pengguna...",
                    'action' => 'broadcast',
                    'message_text' => $target,
                    'targets' => $phones
                ]);
            }

            if ($command === 'restartbot') {
                return response()->json([
                    'reply' => "🔄 Bot sedang direstart...",
                    'action' => 'restart_bot'
                ]);
            }
        }

        return response()->json(['reply' => "Perintah tidak dikenali. Ketik `help` untuk daftar perintah."]);
    }

    public function groupUpdate(Request $request): JsonResponse
    {
        $secret = env('WA_BOT_SECRET', 'pterodactyl_wa_secret');
        if ($request->input('secret') !== $secret) {
            return response()->json(['success' => false], 401);
        }

        if ($request->input('action') === 'joined') {
            $this->settings->set('wa_bot:group_jid', $request->input('group_jid', ''));
            $this->settings->set('wa_bot:group_name', $request->input('group_name', ''));
        } elseif ($request->input('action') === 'left') {
            $this->settings->forget('wa_bot:group_jid');
            $this->settings->forget('wa_bot:group_name');
        }

        return response()->json(['success' => true]);
    }
}
