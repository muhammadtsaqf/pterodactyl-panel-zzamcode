<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Pterodactyl\Models\User;
use Illuminate\Http\Request;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Nest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Services\Deployment\AllocationSelectionService;
use Pterodactyl\Services\Servers\ServerCreationService;
use Illuminate\Support\Str;

class StoreController extends ClientApiController
{
    public function __construct(
        private SettingsRepositoryInterface $settings,
        private AllocationSelectionService $allocationSelectionService,
        private ServerCreationService $serverCreationService
    ) {
        parent::__construct();
    }

    public function info()
    {
        $enabled = $this->settings->get('settings::store:enabled', 1) == 1;
        $prices = [
            'cpu' => (int)$this->settings->get('settings::store:price:cpu', 1000),
            'ram' => (int)$this->settings->get('settings::store:price:ram', 5000),
            'disk' => (int)$this->settings->get('settings::store:price:disk', 2000),
            'database' => (int)$this->settings->get('settings::store:price:database', 1000),
            'backup' => (int)$this->settings->get('settings::store:price:backup', 1000),
            'port' => (int)$this->settings->get('settings::store:price:port', 500),
        ];

        $nests = Nest::with('eggs')->get()->map(function($nest) {
            return [
                'id' => $nest->id,
                'name' => $nest->name,
                'eggs' => $nest->eggs->map(function($egg) {
                    return [
                        'id' => $egg->id,
                        'name' => $egg->name,
                        'description' => $egg->description,
                    ];
                })->values()
            ];
        })->values();

        return [
            'enabled' => $enabled,
            'prices' => $prices,
            'nests' => $nests,
        ];
    }

    public function purchase(Request $request)
    {
        if ($this->settings->get('settings::store:enabled', 1) == 0) {
            return response()->json(['error' => 'Store is currently disabled.'], 403);
        }

        $nodeId = $this->settings->get('settings::store:node_id');
        if (!$nodeId) {
            return response()->json(['error' => 'Store is not properly configured. No default node selected.'], 500);
        }

        $validated = $request->validate([
            'egg_id' => 'required|exists:eggs,id',
            'cpu' => 'required|integer|min:10',
            'ram' => 'required|integer|min:512',
            'disk' => 'required|integer|min:512',
            'databases' => 'required|integer|min:0',
            'backups' => 'required|integer|min:0',
            'ports' => 'required|integer|min:0',
        ]);

        $egg = Egg::with('variables')->findOrFail($validated['egg_id']);

        $priceCpu = (int)$this->settings->get('settings::store:price:cpu', 1000);
        $priceRam = (int)$this->settings->get('settings::store:price:ram', 5000);
        $priceDisk = (int)$this->settings->get('settings::store:price:disk', 2000);
        $priceDb = (int)$this->settings->get('settings::store:price:database', 1000);
        $priceBackup = (int)$this->settings->get('settings::store:price:backup', 1000);
        $pricePort = (int)$this->settings->get('settings::store:price:port', 500);

        // Calculate total cost
        $totalCost = 0;
        $totalCost += ($validated['cpu'] / 10) * $priceCpu;
        $totalCost += ($validated['ram'] / 1024) * $priceRam;
        $totalCost += ($validated['disk'] / 1024) * $priceDisk;
        $totalCost += $validated['databases'] * $priceDb;
        $totalCost += $validated['backups'] * $priceBackup;
        $totalCost += $validated['ports'] * $pricePort;

        /** @var User $user */
        $user = $request->user();

        if ($user->balance < $totalCost) {
            return response()->json(['error' => 'Insufficient balance.'], 400);
        }

        // Need an allocation on the node
        try {
            $allocation = $this->allocationSelectionService->setNodes([$nodeId])->handle();
        } catch (\Exception $e) {
            return response()->json(['error' => 'No available ports on the selected node.'], 500);
        }

        // Deduct balance
        $user->balance -= $totalCost;
        $user->save();

        // Environment variables defaults
        $environment = [];
        foreach ($egg->variables as $variable) {
            $environment[$variable->env_variable] = $variable->default_value;
        }

        $data = [
            'name' => $user->username . '\'s Server',
            'owner_id' => $user->id,
            'egg_id' => $egg->id,
            'nest_id' => $egg->nest_id,
            'node_id' => $nodeId,
            'allocation_id' => $allocation->id,
            'allocation_limit' => $validated['ports'] + 1, // 1 default + additional
            'backup_limit' => $validated['backups'],
            'database_limit' => $validated['databases'],
            'environment' => $environment,
            'memory' => $validated['ram'],
            'disk' => $validated['disk'],
            'cpu' => $validated['cpu'],
            'swap' => 0,
            'io' => 500,
            'image' => $egg->docker_images[0] ?? $egg->docker_image ?? 'ghcr.io/pterodactyl/yolks:java_17',
            'startup' => $egg->startup,
            'start_on_completion' => true,
        ];

        try {
            $server = $this->serverCreationService->handle($data);
            return response()->json(['success' => true, 'server_id' => $server->uuidShort]);
        } catch (\Exception $e) {
            // Refund balance on failure
            $user->balance += $totalCost;
            $user->save();
            return response()->json(['error' => 'Failed to create server: ' . $e->getMessage()], 500);
        }
    }
}
