<?php

namespace App\Http\Controllers;

use App\Models\DemandePermutation;
use App\Models\Etablissement;
use App\Models\LogAction;
use App\Models\User;
use Illuminate\Http\Request;

class AdminStatsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || ($user->role?->code ?? null) !== 'admin') {
            return response()->json([
                'message' => 'Accès refusé.',
            ], 403);
        }

        $users = User::with('role')->get();
        $demandes = DemandePermutation::with(['regionSouhaitee', 'formateur.user'])->get();
        $etablissements = Etablissement::all();
        $logs = LogAction::with('user')->orderByDesc('created_at')->get();
        $mapType = function ($action) {
            $a = mb_strtolower((string) $action);
            if (str_contains($a, 'login') || str_contains($a, 'connexion')) return 'login';
            if (str_contains($a, 'déconnexion') || str_contains($a, 'deconnexion')) return 'logout';
            if (str_contains($a, 'création') || str_contains($a, 'creation') || str_contains($a, 'registration')) return 'create';
            if (str_contains($a, 'suppression')) return 'delete';
            if (str_contains($a, 'mise à jour') || str_contains($a, 'validation') || str_contains($a, 'mise a jour')) return 'update';
            if (str_contains($a, 'blocage')) return 'block';
            return 'view';
        };

        $totalUsers = $users->count();
        $activeUsers = $users->filter(fn ($u) => $u->status === 'actif')->count();

        $roleCounts = $users->reduce(function (array $acc, User $u) {
            $role = strtolower((string) ($u->role?->code ?? ''));
            if ($role === '') {
                return $acc;
            }
            $acc[$role] = ($acc[$role] ?? 0) + 1;
            return $acc;
        }, []);

        $validatedRequests = $demandes->filter(fn ($d) => ($d->etat?->key ?? null) === 'VALIDE')->count();
        $pendingRequests = $demandes->filter(fn ($d) => ($d->etat?->key ?? null) === 'EN_ATTENTE')->count();
        $rejectedRequests = $demandes->filter(fn ($d) => ($d->etat?->key ?? null) === 'REFUSE')->count();
        $totalRequests = $demandes->count();
        $totalEstablishments = $etablissements->count();

        $now = now();

        $sameDay = fn ($a, $b) => $a->year === $b->year && $a->month === $b->month && $a->day === $b->day;
        $currentMonthKey = $now->format('Y-m');

        $newAccountLogs = $logs->filter(function ($log) {
            $action = mb_strtolower((string) ($log->action ?? ''));
            return str_contains($action, 'registration') || str_contains($action, 'création') || str_contains($action, 'creation');
        });
        $verifiedUsers = $users->filter(fn ($user) => $user->email_verified_at);

        $newAccountsToday = $newAccountLogs->filter(fn ($log) => $log->created_at && $sameDay($log->created_at, now()))->count();
        $newAccounts7d = $newAccountLogs->filter(function ($log) {
            if (!$log->created_at) {
                return false;
            }
            return now()->diffInDays($log->created_at) <= 7;
        })->count();

        $monthlyActivityData = [];
        for ($day = 1; $day <= $now->daysInMonth; $day++) {
            $dayDate = $now->copy()->startOfMonth()->addDays($day - 1);

            $dayLogs = $logs->filter(function ($log) use ($dayDate) {
                if (!$log->created_at) {
                    return false;
                }
                return $log->created_at->year === $dayDate->year
                    && $log->created_at->month === $dayDate->month
                    && $log->created_at->day === $dayDate->day;
            });

            $monthlyActivityData[] = [
                'day' => $day,
                'label' => (string) $day,
                'users' => $dayLogs->filter(fn ($log) => $mapType($log->action) === 'login')->count(),
                'signups' => $dayLogs->filter(fn ($log) => $mapType($log->action) === 'create')->count(),
                'emailConfirmations' => $verifiedUsers->filter(function ($user) use ($dayDate) {
                    return $user->email_verified_at
                        && $user->email_verified_at->year === $dayDate->year
                        && $user->email_verified_at->month === $dayDate->month
                        && $user->email_verified_at->day === $dayDate->day;
                })->count(),
                'requests' => $demandes->filter(function ($demande) use ($dayDate) {
                    return $demande->created_at
                        && $demande->created_at->year === $dayDate->year
                        && $demande->created_at->month === $dayDate->month
                        && $demande->created_at->day === $dayDate->day;
                })->count(),
            ];
        }

        $userStatsData = array_map(function ($role, $count) {
            $name = match ($role) {
                'admin' => 'Admins',
                'commission' => 'Commission',
                'formateur' => 'Formateurs',
                'user' => 'Utilisateurs',
                default => $role,
            };

            return ['name' => $name, 'value' => $count];
        }, array_keys($roleCounts), array_values($roleCounts));

        $regionCounts = $demandes->reduce(function (array $acc, DemandePermutation $demande) {
            $region = $demande->regionSouhaitee;
            $regionName = data_get($region, 'value.libelle') ?? $region?->key ?? 'Autre';
            $acc[$regionName] = ($acc[$regionName] ?? 0) + 1;
            return $acc;
        }, []);

        $regionStats = collect($regionCounts)
            ->map(fn ($count, $region) => [
                'region' => $region,
                'users' => $count,
            ])
            ->sortByDesc('users')
            ->take(5)
            ->values()
            ->map(function ($entry) use ($demandes) {
                $share = $demandes->count() > 0 ? ($entry['users'] / $demandes->count()) * 100 : 0;
                return [
                    ...$entry,
                    'growth' => round($share) . '%',
                ];
            })
            ->all();

        $recentActions = $logs->take(5)->map(fn ($log) => [
            'id' => $log->id,
            'user' => $log->user?->name ?? '—',
            'action' => $log->action ?? '',
            'time' => optional($log->created_at)->format('Y-m-d H:i:s'),
            'type' => $mapType($log->action ?? ''),
        ])->values()->all();

        $pendingUsers = $users
            ->filter(fn ($u) => !$u->role || $u->status !== 'actif')
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'status' => $u->status ?: 'inactif',
            ])
            ->values()
            ->all();

        return response()->json([
            'data' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'totalUsersInDb' => $totalUsers,
                'validatedRequests' => $validatedRequests,
                'pendingRequests' => $pendingRequests,
                'rejectedRequests' => $rejectedRequests,
                'totalRequests' => $totalRequests,
                'totalEstablishments' => $totalEstablishments,
                'totalAdmins' => $roleCounts['admin'] ?? 0,
                'totalCommission' => $roleCounts['commission'] ?? 0,
                'totalFormateurs' => $roleCounts['formateur'] ?? 0,
                'pendingVerification' => count($pendingUsers),
                'newAccountsToday' => $newAccountsToday,
                'newAccounts7d' => $newAccounts7d,
                'pendingUsers' => $pendingUsers,
                'dailyActivityData' => $monthlyActivityData,
                'currentMonthKey' => $currentMonthKey,
                'userStatsData' => $userStatsData,
                'regionStats' => $regionStats,
                'recentActions' => $recentActions,
            ],
        ]);
    }
}
