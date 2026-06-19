<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Account;

use Illuminate\Http\Request;
use Pterodactyl\Models\User;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class UpdateProfileController extends ClientApiController
{
    /**
     * Update the user's profile details.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name_first' => 'required|string|max:255',
            'name_last' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'address_1' => 'nullable|string|max:255',
            'address_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
        ]);

        /** @var User $user */
        $user = $request->user();
        
        $user->forceFill([
            'name_first' => $validated['name_first'],
            'name_last' => $validated['name_last'],
            'phone' => $validated['phone'] ?? null,
            'company' => $validated['company'] ?? null,
            'address_1' => $validated['address_1'] ?? null,
            'address_2' => $validated['address_2'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'zip' => $validated['zip'] ?? null,
            'country' => $validated['country'] ?? null,
        ])->save();

        return response()->json([
            'success' => true,
        ]);
    }
}
