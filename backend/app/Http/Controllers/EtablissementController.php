<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use Illuminate\Http\Request;

class EtablissementController extends Controller
{
    public function index(Request $request)
    {
        $etabs = Etablissement::query()
            ->where('actif', true)
            ->orderBy('nom')
            ->get();

        return response()->json(['data' => $etabs]);
    }

    public function getByCity(Request $request, $cityId)
    {
        $etabs = Etablissement::where('ville_id', $cityId)
            ->where('actif', true)
            ->orderBy('nom')
            ->get();

        return response()->json(['data' => $etabs]);
    }

    public function update(Request $request, Etablissement $etablissement)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:20',
            'nom' => 'nullable|string|max:150',
            'adresse' => 'nullable|string|max:255',
            'actif' => 'nullable|boolean',
        ]);

        if (array_key_exists('code', $validated)) {
            $etablissement->code = $validated['code'];
        }
        if (array_key_exists('nom', $validated)) {
            $etablissement->nom = $validated['nom'];
        }
        if (array_key_exists('adresse', $validated)) {
            $etablissement->adresse = $validated['adresse'];
        }
        if (array_key_exists('actif', $validated)) {
            $etablissement->actif = (bool) $validated['actif'];
        }

        $etablissement->save();

        return response()->json([
            'data' => [
                'id' => $etablissement->id,
                'code' => $etablissement->code,
                'nom' => $etablissement->nom,
                'adresse' => $etablissement->adresse,
                'actif' => $etablissement->actif,
            ]
        ]);
    }
}
