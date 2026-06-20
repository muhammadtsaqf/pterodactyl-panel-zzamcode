<?php

namespace Pterodactyl\Console\Commands\Store;

use Illuminate\Console\Command;
use Pterodactyl\Models\Server;
use Pterodactyl\Services\WhatsApp\WhatsAppNotifierService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SendDailyReportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'p:store:daily-report';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily server status report to the WhatsApp group.';

    private $whatsAppNotifier;

    /**
     * Create a new command instance.
     */
    public function __construct(WhatsAppNotifierService $whatsAppNotifier)
    {
        parent::__construct();
        $this->whatsAppNotifier = $whatsAppNotifier;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating daily report...');

        // 1. Servers expiring tomorrow
        $tomorrowStart = Carbon::now()->addDays(1)->startOfDay();
        $tomorrowEnd = Carbon::now()->addDays(1)->endOfDay();

        $expiringTomorrow = Server::with('user')
            ->whereNotNull('store_expires_at')
            ->whereBetween('store_expires_at', [$tomorrowStart, $tomorrowEnd])
            ->where('status', '!=', Server::STATUS_SUSPENDED)
            ->get();

        // 2. Currently Suspended Servers (that are from store)
        $suspendedServers = Server::with('user')
            ->whereNotNull('store_expires_at')
            ->where('status', Server::STATUS_SUSPENDED)
            ->get();

        // 3. Count deleted servers today
        $deletedTodayCount = DB::table('activity_logs')
            ->where('event', 'server:deleted')
            ->whereDate('created_at', Carbon::today())
            ->count();

        $mentions = [];

        $message = "📋 *LAPORAN STATUS SERVER*\n\n";

        $message .= "▰▰▰▰▰▰▰ AKAN SUSPEND BESOK ▰▰▰▰▰▰▰\n";
        $message .= "_Segera perpanjang atau backup data sebelum masa suspend._\n\n";
        
        if ($expiringTomorrow->isEmpty()) {
            $message .= "- Tidak ada server yang akan suspend besok.\n\n";
        } else {
            $count = 1;
            foreach ($expiringTomorrow as $server) {
                $user = $server->user;
                $phone = $user && $user->phone ? $this->whatsAppNotifier->formatPhoneNumber($user->phone) : '-';
                if ($phone !== '-') {
                    $mentions[] = $phone . '@s.whatsapp.net';
                    $phoneStr = "@{$phone}";
                } else {
                    $phoneStr = $user ? $user->email : 'Unknown';
                }
                
                $dateFormatted = Carbon::parse($server->store_expires_at)->translatedFormat('d F Y');
                $message .= "*{$count}. {$server->name}*\n";
                $message .= "   🆔 ID: `{$server->uuidShort}` | 👤 Pemilik: {$phoneStr}\n";
                $message .= "   📅 Tanggal Suspend: {$dateFormatted}\n\n";
                $count++;
            }
        }

        $message .= "▰▰▰▰▰▰ DALAM MASA SUSPEND ▰▰▰▰▰▰\n";
        $message .= "_Segera lakukan perpanjangan agar server tidak dihapus sistem._\n\n";

        if ($suspendedServers->isEmpty()) {
            $message .= "- Tidak ada server yang sedang disuspend.\n\n";
        } else {
            $count = 1;
            foreach ($suspendedServers as $server) {
                $user = $server->user;
                $phone = $user && $user->phone ? $this->whatsAppNotifier->formatPhoneNumber($user->phone) : '-';
                if ($phone !== '-') {
                    $mentions[] = $phone . '@s.whatsapp.net';
                    $phoneStr = "@{$phone}";
                } else {
                    $phoneStr = $user ? $user->email : 'Unknown';
                }
                
                $dateFormatted = Carbon::parse($server->store_expires_at)->translatedFormat('d F Y');
                $message .= "*{$count}. {$server->name}*\n";
                $message .= "   🆔 ID: `{$server->uuidShort}` | 👤 Pemilik: {$phoneStr}\n";
                $message .= "   📅 Tanggal Suspend: {$dateFormatted}\n\n";
                $count++;
            }
        }

        $currentTime = Carbon::now()->translatedFormat('d F Y H:i');

        $message .= "▰▰▰▰▰▰▰▰ RINGKASAN ▰▰▰▰▰▰▰▰\n";
        $message .= "   ⏳ Akan Suspend  : {$expiringTomorrow->count()}\n";
        $message .= "   🟡 Sedang Suspend : {$suspendedServers->count()}\n";
        $message .= "   ⚫ Telah Dihapus  : {$deletedTodayCount}\n\n";
        $message .= "⏱️ Waktu Pemeriksaan : {$currentTime}\n\n";
        $message .= "💡 *Catatan Penting:*\n";
        $message .= "_Server yang telah disuspend tidak dapat diaktifkan kembali sebelum melakukan pembayaran._";

        $mentions = array_unique($mentions);
        
        $this->whatsAppNotifier->sendToGroup($message, array_values($mentions));
        $this->info('Daily report sent successfully.');

        return 0;
    }
}
