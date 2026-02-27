<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $isUserRole = $user->role && strtoupper($user->role->code) === 'USER';
            $isInactive = !$user->actif;

            if ($isUserRole || $isInactive) {
                $allowedRoutes = ['me', 'logout'];
                $currentRoute = $request->route()->getName() ?: explode('/', $request->path())[1] ?? '';

                if (!in_array($currentRoute, $allowedRoutes) && !$request->is('api/me') && !$request->is('api/logout')) {
                    return response()->json([
                        'message' => 'Accès restreint. Votre compte est en attente d\'activation par un administrateur.'
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
