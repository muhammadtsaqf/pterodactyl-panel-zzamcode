<?php

namespace Pterodactyl\Http\Controllers\Base;

use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    /**
     * Returns public statistics for the landing page.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'servers' => Server::count(),
        ]);
    }
}
