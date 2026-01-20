<?php

namespace App\Http\Controllers;

use App\Models\LogAction;
use Illuminate\Http\Request;

class LogsController extends Controller
{
    public function index(Request $request)
    {
        $query = LogAction::with('user')->orderByDesc('date_action');

        if ($type = $request->query('type')) {
            $query->where('action', 'LIKE', '%' . $type . '%');
        }

        if ($date = $request->query('date')) {
            $query->whereDate('date_action', $date);
        }

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'LIKE', '%' . $search . '%')
                  ->orWhere('adresse_ip', 'LIKE', '%' . $search . '%');
            });
        }

        $logs = $query->get();

        $mapType = function ($action) {
            $a = mb_strtolower($action);
            if (str_contains($a, 'connexion')) return 'login';
            if (str_contains($a, 'déconnexion') || str_contains($a, 'deconnexion')) return 'logout';
            if (str_contains($a, 'création') || str_contains($a, 'creation')) return 'create';
            if (str_contains($a, 'suppression')) return 'delete';
            if (str_contains($a, 'mise à jour') || str_contains($a, 'validation') || str_contains($a, 'mise a jour')) return 'update';
            if (str_contains($a, 'blocage')) return 'block';
            return 'view';
        };

        $data = $logs->map(function ($log) use ($mapType) {
            return [
                'id' => $log->id,
                'user' => $log->user ? ($log->user->nom ?? '—') : '—',
                'action' => $log->action ?? '',
                'type' => $mapType($log->action ?? ''),
                'date' => optional($log->date_action)->format('Y-m-d H:i:s'),
                'ip' => $log->adresse_ip ?? '',
            ];
        });

        return response()->json(['data' => $data]);
    }
}

