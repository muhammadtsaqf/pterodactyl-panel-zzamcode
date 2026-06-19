<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Contracts\Console\Kernel;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Contracts\Repository\NodeRepositoryInterface;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    /**
     * StoreController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private Kernel $kernel,
        private SettingsRepositoryInterface $settings,
        private NodeRepositoryInterface $nodes
    ) {
    }

    /**
     * Render the UI for Store settings.
     */
    public function index(): View
    {
        return view('admin.store', [
            'nodes' => $this->nodes->all(),
        ]);
    }

    /**
     * Handle store settings update.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'store:enabled' => 'required|in:0,1',
            'store:node_id' => 'nullable|integer|exists:nodes,id',
            'store:price:cpu' => 'required|integer|min:0',
            'store:price:ram' => 'required|integer|min:0',
            'store:price:disk' => 'required|integer|min:0',
            'store:price:database' => 'required|integer|min:0',
            'store:price:backup' => 'required|integer|min:0',
            'store:price:port' => 'required|integer|min:0',
        ]);

        foreach ($data as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Store settings have been updated successfully.')->flash();

        return redirect()->route('admin.store');
    }
}
