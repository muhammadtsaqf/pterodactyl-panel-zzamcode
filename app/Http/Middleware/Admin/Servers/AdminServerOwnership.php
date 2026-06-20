<?php

namespace Pterodactyl\Http\Middleware\Admin\Servers;

use Closure;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AdminServerOwnership
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $server = $request->route()->parameter('server');
        
        if ($server instanceof Server) {
            $user = $request->user();
            
            // If the user is an admin but not super admin, they must own the server
            if ($user && !$user->super_admin && $user->root_admin) {
                if ($server->owner_id !== $user->id) {
                    throw new AccessDeniedHttpException('You do not have permission to view or manage servers that you do not own.');
                }
            }
        }

        return $next($request);
    }
}
