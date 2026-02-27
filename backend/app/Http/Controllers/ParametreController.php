<?php

namespace App\Http\Controllers;

use App\Models\Parametre;
use Illuminate\Http\Request;

class ParametreController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');
        $includeInactive = $request->query('include_inactive');

        $query = Parametre::query()->orderBy('ordre');
        
        if (!$includeInactive) {
            $query->where('actif', true);
        }

        if ($type) {
            $query->where('type', $type);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'code' => 'required|string',
            'libelle' => 'required|string',
            'actif' => 'boolean',
            'ordre' => 'integer',
            'parent_id' => 'nullable|exists:parametres,id',
        ]);

        $parametre = Parametre::create($request->all());

        return response()->json([
            'message' => 'Paramètre créé avec succès',
            'data' => $parametre
        ]);
    }

    public function update(Request $request, Parametre $parametre)
    {
        $request->validate([
            'libelle' => 'string',
            'actif' => 'boolean',
            'ordre' => 'integer',
            'parent_id' => 'nullable|exists:parametres,id',
        ]);

        $parametre->update($request->all());

        return response()->json([
            'message' => 'Paramètre mis à jour avec succès',
            'data' => $parametre
        ]);
    }

    public function destroy(Parametre $parametre)
    {
        $parametre->delete();
        return response()->json(['message' => 'Paramètre supprimé']);
    }
}

