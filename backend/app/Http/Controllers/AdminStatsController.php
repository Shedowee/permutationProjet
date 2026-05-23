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

        // Optimization: Use counts instead of fetching all records
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();

        $roleCounts = User::with('role')->get()->reduce(function (array $acc, User $u) {
            $role = strtolower((string) ($u->role?->code ?? ''));
            if ($role !== '') {
                $acc[$role] = ($acc[$role] ?? 0) + 1;
            }
            return $acc;
        }, []);

        $demandesCounts = DemandePermutation::with('etat')->get();
        $validatedRequests = $demandesCounts->filter(fn ($d) => ($d->etat?->key ?? null) === 'VALIDE')->count();
        $pendingRequests = $demandesCounts->filter(fn ($d) => ($d->etat?->key ?? null) === 'EN_ATTENTE')->count();
        $rejectedRequests = $demandesCounts->filter(fn ($d) => ($d->etat?->key ?? null) === 'REFUSE')->count();
        $totalRequests = $demandesCounts->count();
        
        $totalEstablishments = Etablissement::count();

        $now = now();
        $currentMonthKey = $now->format('Y-m');

        // Fetch logs for the last 30 days only for performance
        $recentLogs = LogAction::with('user')
            ->where('created_at', '>=', now()->subDays(30))
            ->orderByDesc('created_at')
            ->get();

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

        $newAccountLogs = $recentLogs->filter(function ($log) {
            $action = mb_strtolower((string) ($log->action ?? ''));
            return str_contains($action, 'registration') || str_contains($action, 'création') || str_contains($action, 'creation');
        });

        $newAccountsToday = $newAccountLogs->filter(fn ($log) => $log->created_at && $log->created_at->isToday())->count();
        $newAccounts7d = $newAccountLogs->filter(fn ($log) => $log->created_at && $log->created_at->diffInDays(now()) <= 7)->count();

        // Daily activity data for the current month
        $monthlyActivityData = [];
        $daysInMonth = $now->daysInMonth;
        
        // Fetch verified users created this month
        $verifiedUsersThisMonth = User::whereNotNull('email_verified_at')
            ->whereMonth('email_verified_at', $now->month)
            ->whereYear('email_verified_at', $now->year)
            ->get();

        // Fetch demandes created this month
        $demandesThisMonth = DemandePermutation::whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->get();

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dayDate = $now->copy()->day($day);

            $dayLogs = $recentLogs->filter(fn ($log) => $log->created_at && $log->created_at->isSameDay($dayDate));

            $monthlyActivityData[] = [
                'day' => $day,
                'label' => (string) $day,
                'users' => $dayLogs->filter(fn ($log) => $mapType($log->action) === 'login')->count(),
                'signups' => $dayLogs->filter(fn ($log) => $mapType($log->action) === 'create')->count(),
                'emailConfirmations' => $verifiedUsersThisMonth->filter(fn ($u) => $u->email_verified_at->isSameDay($dayDate))->count(),
                'requests' => $demandesThisMonth->filter(fn ($d) => $d->created_at && $d->created_at->isSameDay($dayDate))->count(),
            ];
        }

        $userStatsData = array_map(function ($role, $count) {
            $name = match ($role) {
                'admin' => 'Admins',
                'commission' => 'Commission',
                'formateur' => 'Formateurs',
                'user' => 'Utilisateurs',
                default => ucfirst($role),
            };
            return ['name' => $name, 'value' => $count];
        }, array_keys($roleCounts), array_values($roleCounts));

        $regionStats = DemandePermutation::with('regionSouhaitee')
            ->get()
            ->groupBy(function ($d) {
                $region = $d->regionSouhaitee;
                return data_get($region, 'value.libelle') ?? $region?->key ?? 'Autre';
            })
            ->map(fn ($group) => ['region' => $group->first()->regionSouhaitee?->key ?? 'Autre', 'users' => $group->count()])
            ->sortByDesc('users')
            ->take(5)
            ->values()
            ->map(function ($entry) use ($totalRequests) {
                $share = $totalRequests > 0 ? ($entry['users'] / $totalRequests) * 100 : 0;
                return [
                    ...$entry,
                    'growth' => round($share) . '%',
                ];
            })
            ->all();

        $recentActions = $recentLogs->take(5)->map(fn ($log) => [
            'id' => $log->id,
            'user' => $log->user?->name ?? '—',
            'action' => $log->action ?? '',
            'time' => optional($log->created_at)->format('Y-m-d H:i:s'),
            'type' => $mapType($log->action ?? ''),
        ])->values()->all();

        $pendingUsers = User::whereNull('role_id')
            ->orWhere('status', '!=', 'active')
            ->take(10)
            ->get()
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
