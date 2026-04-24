<?php

namespace App\Http\Controllers;

use App\Models\LogAction;
use Illuminate\Http\Request;

class LogsController extends Controller
{
    public function index(Request $request)
    {
        $query = LogAction::with('user')->orderByDesc('created_at');

        if ($type = $request->query('type')) {
            $query->where('action', 'LIKE', '%' . $type . '%');
        }

        if ($date = $request->query('date')) {
            $query->whereDate('created_at', $date);
        }

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'LIKE', '%' . $search . '%')
                  ->orWhere('table_name', 'LIKE', '%' . $search . '%')
                  ->orWhere('ip_address', 'LIKE', '%' . $search . '%');
            });
        }

        $limit = $request->query('limit', 5);

        $mapType = function ($action) {
            $a = mb_strtolower($action);
            if (str_contains($a, 'login') || str_contains($a, 'connexion')) return 'login';
            if (str_contains($a, 'déconnexion') || str_contains($a, 'deconnexion')) return 'logout';
            if (str_contains($a, 'création') || str_contains($a, 'creation')) return 'create';
            if (str_contains($a, 'suppression')) return 'delete';
            if (str_contains($a, 'mise à jour') || str_contains($a, 'validation') || str_contains($a, 'mise a jour')) return 'update';
            if (str_contains($a, 'blocage')) return 'block';
            return 'view';
        };

        if ($limit == -1) {
            $logs = $query->get();
            $data = $logs->map(function ($log) use ($mapType) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? ($log->user->name ?? '—') : '—',
                    'action' => $log->action ?? '',
                    'type' => $mapType($log->action ?? ''),
                    'date' => optional($log->created_at)->format('Y-m-d H:i:s'),
                    'table' => $log->table_name ?? '',
                    'ip' => $log->ip_address ?? '—',
                ];
            });
            return response()->json(['data' => $data]);
        }

        $logs = $query->paginate($limit);

        $data = $logs->getCollection()->map(function ($log) use ($mapType) {
            return [
                'id' => $log->id,
                'user' => $log->user ? ($log->user->name ?? '—') : '—',
                'action' => $log->action ?? '',
                'type' => $mapType($log->action ?? ''),
                'date' => optional($log->created_at)->format('Y-m-d H:i:s'),
                'table' => $log->table_name ?? '',
                'ip' => $log->ip_address ?? '—',
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
            ]
        ]);
    }

    public function show(LogAction $log)
    {
        $log->load('user');
        
        $mapType = function ($action) {
            $a = mb_strtolower($action);
            if (str_contains($a, 'login') || str_contains($a, 'connexion')) return 'login';
            if (str_contains($a, 'déconnexion') || str_contains($a, 'deconnexion')) return 'logout';
            if (str_contains($a, 'création') || str_contains($a, 'creation')) return 'create';
            if (str_contains($a, 'suppression')) return 'delete';
            if (str_contains($a, 'mise à jour') || str_contains($a, 'validation') || str_contains($a, 'mise a jour')) return 'update';
            if (str_contains($a, 'blocage')) return 'block';
            return 'view';
        };

        return response()->json([
            'data' => [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'user' => $log->user ? ($log->user->name ?? '—') : '—',
                'user_email' => $log->user ? $log->user->email : '—',
                'action' => $log->action ?? '',
                'type' => $mapType($log->action ?? ''),
                'date' => optional($log->created_at)->format('Y-m-d H:i:s'),
                'table' => $log->table_name ?? '',
                'table_name' => $log->table_name ?? '',
                'ip' => $log->ip_address ?? '—',
                'record_id' => $log->record_id,
                'before' => $log->before,
                'after' => $log->after,
            ]
        ]);
    }
}
