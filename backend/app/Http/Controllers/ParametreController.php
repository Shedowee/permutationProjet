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
        $parentId = $request->query('parent_id');

        $query = Parametre::query()->orderBy('ordre');
        
        if (!$includeInactive) {
            $query->where('actif', true);
        }

        if ($type) {
            $query->where('type', $type);
        }
        if ($parentId) {
            $query->where('parent_id', $parentId);
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

        $parametre = Parametre::create([
            'type' => $request->type,
            'key' => $request->code,
            'value' => ['libelle' => $request->libelle],
            'actif' => $request->actif ?? true,
            'ordre' => $request->ordre ?? 0,
            'parent_id' => $request->parent_id,
        ]);

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

        $data = $request->only(['actif', 'ordre', 'parent_id']);
        
        if ($request->has('libelle')) {
            $data['value'] = ['libelle' => $request->libelle];
        }

        $parametre->update($data);

        return response()->json([
            'message' => 'Paramètre mis à jour avec succès',
            'data' => $parametre
        ]);
    }

    public function getCitiesByRegion(Request $request, $regionId)
    {
        $cities = Parametre::where('type', 'VILLE')
            ->where('parent_id', $regionId)
            ->where('actif', true)
            ->orderBy('ordre')
            ->get();

        return response()->json(['data' => $cities]);
    }

    public function destroy(Parametre $parametre)
    {
        $parametre->delete();
        return response()->json(['message' => 'Paramètre supprimé']);
    }
}
