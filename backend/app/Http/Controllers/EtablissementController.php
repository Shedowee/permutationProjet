<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use Illuminate\Http\Request;

class EtablissementController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->query('limit', 5);
        $query = Etablissement::query()->with(['ville.region'])->orderBy('name');

        // Scope to the user's assigned établissements if their profile defines one
        $user = $request->user();
        if ($user && $user->commission) {
            $ids = is_array(optional($user->commission)->metadata['etablissements'] ?? null) ? $user->commission->metadata['etablissements'] : [];
            if ($ids) $query->whereIn('id', $ids);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', '%' . $search . '%')
                  ->orWhere('address', 'LIKE', '%' . $search . '%');
            });
        }

        if ($limit == -1) {
            $etabs = $query->get();
            return response()->json(['data' => $etabs]);
        }

        $etabs = $query->paginate($limit);

        return response()->json([
            'data' => $etabs->getCollection(),
            'meta' => [
                'current_page' => $etabs->currentPage(),
                'last_page' => $etabs->lastPage(),
                'total' => $etabs->total(),
                'per_page' => $etabs->perPage(),
            ]
        ]);
    }

    public function getByCity(Request $request, $cityId)
    {
        $etabs = Etablissement::query()
            ->where('city_id', $cityId)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $etabs]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'address' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:100',
            'city_id' => 'nullable|exists:parametres,id',
            'metadata' => 'nullable|array',
            'actif' => 'sometimes|boolean',
        ]);

        $validated['actif'] = $validated['actif'] ?? true;
        $etab = Etablissement::create($validated);

        return response()->json(['data' => $etab->load(['ville.region'])], 201);
    }

    public function update(Request $request, Etablissement $etablissement)
    {
        $user = $request->user();
        if ($user && $user->commission) {
            $ids = is_array(optional($user->commission)->metadata['etablissements'] ?? null) ? $user->commission->metadata['etablissements'] : [];
            if ($ids && !in_array($etablissement->id, $ids)) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        }
        $validated = $request->validate([
            'name' => 'nullable|string|max:150',
            'address' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:100',
            'city_id' => 'nullable|exists:parametres,id',
            'metadata' => 'nullable|array',
            'actif' => 'sometimes|boolean',
        ]);

        $etablissement->update($validated);

        return response()->json([
            'data' => $etablissement->load(['ville.region'])
        ]);
    }

    public function destroy(Request $request, Etablissement $etablissement)
    {
        $user = $request->user();
        if ($user && $user->commission) {
            $ids = is_array(optional($user->commission)->metadata['etablissements'] ?? null) ? $user->commission->metadata['etablissements'] : [];
            if ($ids && !in_array($etablissement->id, $ids)) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        }
        $etablissement->delete();
        return response()->json(['message' => 'Etablissement supprimé']);
    }
}
