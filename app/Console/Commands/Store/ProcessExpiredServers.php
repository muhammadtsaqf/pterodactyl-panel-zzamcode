<?php

namespace Pterodactyl\Console\Commands\Store;

use Illuminate\Console\Command;
use Pterodactyl\Models\Server;
use Pterodactyl\Services\Servers\ServerDeletionService;

class ProcessExpiredServers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'store:process-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process expired servers from the store (suspend or delete)';

    /**
     * @var \Pterodactyl\Services\Servers\ServerDeletionService
     */
    private $deletionService;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(ServerDeletionService $deletionService)
    {
        parent::__construct();
        $this->deletionService = $deletionService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Find servers that have expired but are not yet suspended
        $expiredToSuspend = Server::whereNotNull('store_expires_at')
            ->where('store_expires_at', '<', now())
            ->where('status', '!=', Server::STATUS_SUSPENDED)
            ->get();

        foreach ($expiredToSuspend as $server) {
            $this->info("Suspending server {$server->uuidShort} due to expiration.");
            $server->update(['status' => Server::STATUS_SUSPENDED]);
        }

        // Find servers that have been expired for more than 3 days and are suspended
        $expiredToDelete = Server::whereNotNull('store_expires_at')
            ->where('store_expires_at', '<', now()->subDays(3))
            ->where('status', Server::STATUS_SUSPENDED)
            ->get();

        foreach ($expiredToDelete as $server) {
            $this->info("Deleting server {$server->uuidShort} because it was expired for 3 days.");
            try {
                $this->deletionService->withForce()->handle($server);
            } catch (\Exception $e) {
                $this->error("Failed to delete server {$server->uuidShort}: {$e->getMessage()}");
            }
        }

        return 0;
    }
}
