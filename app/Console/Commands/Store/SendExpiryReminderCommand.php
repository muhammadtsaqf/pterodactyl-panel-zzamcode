<?php

namespace Pterodactyl\Console\Commands\Store;

use Illuminate\Console\Command;
use Pterodactyl\Models\Server;
use Pterodactyl\Services\WhatsApp\WhatsAppNotifierService;
use Carbon\Carbon;

class SendExpiryReminderCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'p:store:remind-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send WhatsApp reminders for servers expiring in 3 days or 1 day.';

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
        $this->info('Starting store expiry reminder check...');

        // Find servers expiring in exactly 3 days
        $threeDaysFromNowStart = Carbon::now()->addDays(3)->startOfDay();
        $threeDaysFromNowEnd = Carbon::now()->addDays(3)->endOfDay();

        $servers3Days = Server::with('user')
            ->whereNotNull('store_expires_at')
            ->whereBetween('store_expires_at', [$threeDaysFromNowStart, $threeDaysFromNowEnd])
            ->get();

        foreach ($servers3Days as $server) {
            $user = $server->user;
            if ($user && $user->phone) {
                $message = "⚠️ *PENGINGAT MASA AKTIF*\n\nHalo {$user->name_first}!\nServer Anda *{$server->name}* akan kedaluwarsa dalam waktu *3 HARI* (pada {$server->store_expires_at->format('d M Y')}).\n\nYuk segera perpanjang di menu Store panel agar server tidak di-suspend!";
                $this->whatsAppNotifier->send($user, $message);
                $this->info("Sent 3-day reminder to {$user->email} for server {$server->name}");
            }
        }

        // Find servers expiring in exactly 1 day
        $oneDayFromNowStart = Carbon::now()->addDays(1)->startOfDay();
        $oneDayFromNowEnd = Carbon::now()->addDays(1)->endOfDay();

        $servers1Day = Server::with('user')
            ->whereNotNull('store_expires_at')
            ->whereBetween('store_expires_at', [$oneDayFromNowStart, $oneDayFromNowEnd])
            ->get();

        foreach ($servers1Day as $server) {
            $user = $server->user;
            if ($user && $user->phone) {
                $message = "🚨 *PERINGATAN MASA AKTIF*\n\nHalo {$user->name_first}!\nServer Anda *{$server->name}* akan kedaluwarsa dalam waktu *1 HARI*!\n\nJika tidak diperpanjang, server akan di-suspend otomatis besok. Silakan perpanjang melalui menu Store di panel.";
                $this->whatsAppNotifier->send($user, $message);
                $this->info("Sent 1-day reminder to {$user->email} for server {$server->name}");
            }
        }

        $this->info('Expiry reminder check completed.');
        return 0;
    }
}
