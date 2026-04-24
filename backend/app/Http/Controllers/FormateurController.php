<?php

namespace App\Http\Controllers;

use App\Models\Formateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FormateurController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        $formateur = Formateur::with(['user', 'etablissement.ville.region'])
            ->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_number' => 'F' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                    'position' => 'Formateur',
                ]
            );
        $formateur->load(['user', 'etablissement.ville.region']);

        if (!$formateur) {
            return response()->json(['message' => 'Formateur profile not found'], 404);
        }

        return response()->json(['data' => $formateur]);
    }

    public function index(Request $request)
    {
        $query = Formateur::with(['user', 'etablissement.ville.region']);

        if ($request->user()?->admin) {
            $ids = is_array(optional($request->user()->admin)->metadata['etablissements'] ?? null) ? $request->user()->admin->metadata['etablissements'] : [];
            if ($ids) {
                $query->where(function ($q) use ($ids) {
                    $q->whereIn('establishment_id', $ids)
                      ->orWhereHas('etablissements', function ($etabQuery) use ($ids) {
                          $etabQuery->whereIn('etablissements.id', $ids);
                      });
                });
            }
        } elseif ($request->user()?->commission) {
            $ids = is_array(optional($request->user()->commission)->metadata['etablissements'] ?? null) ? $request->user()->commission->metadata['etablissements'] : [];
            if ($ids) {
                $query->where(function ($q) use ($ids) {
                    $q->whereIn('establishment_id', $ids)
                      ->orWhereHas('etablissements', function ($etabQuery) use ($ids) {
                          $etabQuery->whereIn('etablissements.id', $ids);
                      });
                });
            }
        }

        $formateurs = $query->get();
        return response()->json(['data' => $formateurs]);
    }

    public function show($id)
    {
        $formateur = Formateur::with(['user', 'etablissement.ville.region'])->find($id);
        if (!$formateur) {
            return response()->json(['message' => 'Formateur not found'], 404);
        }
        return response()->json(['data' => $formateur]);
    }
}
