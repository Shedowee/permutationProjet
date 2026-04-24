<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    private const LIMITED_ACCESS_PATHS = [
        'api/me',
        'api/logout',
        'api/email/resend',
        'api/user/profile',
        'api/user/password',
        'api/user/email',
        'api/user/profile-picture',
        'api/notifications',
        'api/notifications/unread-count',
    ];

    private function canAccessLimitedRoutes(string $path): bool
    {
        if (in_array($path, self::LIMITED_ACCESS_PATHS, true)) {
            return true;
        }

        return str_starts_with($path, 'api/notifications/');
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            if ($user->isBlockedAccount()) {
                return response()->json([
                    'message' => 'Accès refusé. Votre compte est suspendu ou désactivé.'
                ], 403);
            }

            if (!$user->isActiveAccount() && !$this->canAccessLimitedRoutes($request->path())) {
                return response()->json([
                    'message' => 'Accès restreint. Votre compte doit encore être validé par un administrateur.'
                ], 403);
            }
        }

        return $next($request);
    }
}
