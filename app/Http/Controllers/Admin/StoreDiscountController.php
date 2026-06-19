<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\StoreDiscount;
use Prologue\Alerts\AlertsMessageBag;

class StoreDiscountController extends Controller
{
    private $alert;

    /**
     * StoreDiscountController constructor.
     */
    public function __construct(AlertsMessageBag $alert)
    {
        $this->alert = $alert;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        $discounts = StoreDiscount::orderBy('id', 'desc')->get();

        return view('admin.store_discounts.index', [
            'discounts' => $discounts,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'code' => 'required|string|max:50|unique:store_discounts,code',
            'discount_percent' => 'required|integer|min:1|max:100',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
        ]);

        StoreDiscount::create([
            'code' => strtoupper($request->input('code')),
            'discount_percent' => $request->input('discount_percent'),
            'max_uses' => $request->input('max_uses'),
            'expires_at' => $request->input('expires_at'),
        ]);

        $this->alert->success('Successfully created a new discount code.')->flash();

        return redirect()->route('admin.store_discounts');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $discount = StoreDiscount::findOrFail($id);
        $discount->delete();

        $this->alert->success('Successfully deleted the discount code.')->flash();

        return redirect()->route('admin.store_discounts');
    }
}
