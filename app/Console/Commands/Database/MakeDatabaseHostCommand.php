<?php

namespace Pterodactyl\Console\Commands\Database;

use Illuminate\Console\Command;
use Pterodactyl\Services\Databases\Hosts\HostCreationService;

class MakeDatabaseHostCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'p:database-host:make
                            {--name= : A name to identify the database host.}
                            {--host= : The IP address or FQDN of the database host.}
                            {--port= : The port that MySQL is running on.}
                            {--username= : The username for the database host.}
                            {--password= : The password for the database host.}
                            {--node= : The Node ID to link this database host to (optional).}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates a new database host on the system via the CLI.';

    /**
     * MakeDatabaseHostCommand constructor.
     */
    public function __construct(private HostCreationService $creationService)
    {
        parent::__construct();
    }

    /**
     * Handle the command execution process.
     *
     * @throws \Throwable
     */
    public function handle()
    {
        $data['name'] = $this->option('name') ?? $this->ask('Enter a short identifier used to distinguish this host from others');
        $data['host'] = $this->option('host') ?? $this->ask('Enter the IP address or FQDN of the database host');
        $data['port'] = $this->option('port') ?? $this->ask('Enter the port that MySQL is running on', '3306');
        $data['username'] = $this->option('username') ?? $this->ask('Enter the username for the database account');
        $data['password'] = $this->option('password') ?? $this->secret('Enter the password for the database account');
        $data['node_id'] = $this->option('node') ?? $this->ask('Enter the Node ID to link this database host to (leave blank for none)', null);

        if (empty($data['node_id'])) {
            $data['node_id'] = null;
        }

        try {
            $host = $this->creationService->handle($data);
            $this->info('Successfully created a new database host "' . $host->name . '" (ID: ' . $host->id . ').');
        } catch (\Exception $ex) {
            $this->error('Failed to create database host: ' . $ex->getMessage());
        }
    }
}
