<?php

namespace App\Http\Controllers;

use App\Models\AiRecommendation;
use App\Models\DemandePermutation;
use App\Models\Formateur;
use App\Services\AiRecommendationService;
use Illuminate\Http\Request;

class AiRecommendationController extends Controller
{
    public function __construct(private readonly AiRecommendationService $aiRecommendationService)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = AiRecommendation::with([
            'demande.formateur.user',
            'demande.formateur.etablissement.ville.region',
            'demande.etablissementSouhaite',
            'actedBy',
        ])->latest();

        if (!$user?->hasPermission('approve_demandes')) {
            $formateur = Formateur::where('user_id', $user?->id)->first();
            if (!$formateur) {
                return response()->json(['data' => []]);
            }
            $query->whereHas('demande', fn ($q) => $q->where('formateur_id', $formateur->id));
        } else {
            $query->where(function ($q) {
                $q->where('type', '!=', 'multihop')
                    ->orWhere('status', 'accepted');
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json(['data' => $query->limit((int) $request->query('limit', 12))->get()]);
    }

    public function scan(Request $request, DemandePermutation $demande)
    {
        $user = $request->user();
        if (!$user?->hasPermission('approve_demandes') && $user?->role?->code !== 'commission') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $recommendations = $this->aiRecommendationService->analyzeDemande($demande);

        return response()->json(['data' => $recommendations]);
    }

    public function accept(Request $request, AiRecommendation $recommendation)
    {
        return $this->act($request, $recommendation, 'accepted');
    }

    public function refuse(Request $request, AiRecommendation $recommendation)
    {
        return $this->act($request, $recommendation, 'refused');
    }

    private function act(Request $request, AiRecommendation $recommendation, string $status)
    {
        $user = $request->user();

        if (!$user?->hasPermission('approve_demandes')) {
            $formateur = Formateur::where('user_id', $user?->id)->first();
            if (!$formateur || $recommendation->demande?->formateur_id !== $formateur->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $recommendation->update([
            'status' => $status,
            'acted_by_user_id' => $user->id,
            'acted_at' => now(),
        ]);

        if ($status === 'accepted' && !$user?->hasPermission('approve_demandes')) {
            $this->aiRecommendationService->notifyRecommendationAccepted($recommendation->fresh(['demande.formateur.user']));
        }

        return response()->json(['data' => $recommendation->fresh(['demande', 'actedBy'])]);
    }
}
