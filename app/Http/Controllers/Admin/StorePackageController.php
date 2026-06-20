<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\StorePackage;
use Pterodactyl\Models\Egg;
use Pterodactyl\Contracts\Repository\NodeRepositoryInterface;

class StorePackageController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private NodeRepositoryInterface $nodes
    ) {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        return view('admin.store.packages.index', [
            'packages' => StorePackage::with(['node', 'egg'])->get(),
            'nodes' => $this->nodes->all(),
            'eggs' => Egg::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:191',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'cpu' => 'required|integer|min:0',
            'memory' => 'required|integer|min:0',
            'disk' => 'required|integer|min:0',
            'databases' => 'required|integer|min:0',
            'backups' => 'required|integer|min:0',
            'ports' => 'required|integer|min:1',
            'egg_id' => 'required|integer|exists:eggs,id',
            'node_id' => 'required|integer|exists:nodes,id',
            'is_active' => 'boolean',
        ]);

        $data['is_active'] = $request->has('is_active');

        StorePackage::create($data);

        $this->alert->success('Successfully created a new store package.')->flash();

        return redirect()->route('admin.store.packages');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StorePackage $package): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:191',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'cpu' => 'required|integer|min:0',
            'memory' => 'required|integer|min:0',
            'disk' => 'required|integer|min:0',
            'databases' => 'required|integer|min:0',
            'backups' => 'required|integer|min:0',
            'ports' => 'required|integer|min:1',
            'egg_id' => 'required|integer|exists:eggs,id',
            'node_id' => 'required|integer|exists:nodes,id',
            'is_active' => 'boolean',
        ]);

        $data['is_active'] = $request->has('is_active');

        $package->update($data);

        $this->alert->success('Successfully updated the store package.')->flash();

        return redirect()->route('admin.store.packages');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StorePackage $package): RedirectResponse
    {
        $package->delete();

        $this->alert->success('Successfully deleted the store package.')->flash();

        return redirect()->route('admin.store.packages');
    }
}
