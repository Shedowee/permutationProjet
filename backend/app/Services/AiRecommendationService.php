<?php

namespace App\Services;

use App\Models\AiRecommendation;
use App\Models\DemandePermutation;
use App\Models\Formateur;
use App\Models\Parametre;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiRecommendationService
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    /**
     * Analyze one demande against the active pending market and persist returned recommendations.
     *
     * @return Collection<int, AiRecommendation>
     */
    public function analyzeDemande(DemandePermutation $demande, int $maxResults = 8): Collection
    {
        $demande->loadMissing([
            'formateur.user',
            'formateur.etablissement.ville.parent',
            'etat',
            'regionSouhaitee',
            'villeSouhaitee',
            'etablissementSouhaite',
        ]);

        $pendingDemandes = $this->pendingDemandes();
        if (!$pendingDemandes->contains('id', $demande->id)) {
            $pendingDemandes->push($demande);
        }

        $payload = [
            'target_demande_id' => $demande->id,
            'demandes' => $pendingDemandes->map(fn (DemandePermutation $item) => $this->serializeDemande($item))->values()->all(),
            'max_results' => $maxResults,
            'max_cycle_length' => 4,
        ];

        $response = $this->callAiService('/match/full', $payload);
        $items = $this->selectWorkflowRecommendations(collect($response['recommendations'] ?? []), $maxResults);

        if ($items->isEmpty()) {
            $items = $this->buildLocalWorkflowRecommendations($demande, $pendingDemandes, $maxResults);
        }

        $recommendations = $items
            ->map(fn (array $item) => $this->persistRecommendation($demande, $item))
            ->filter();

        if ($recommendations->isNotEmpty()) {
            $this->notifyRecommendationAvailable($demande, $recommendations);
        }

        return $recommendations->values();
    }

    public function notifyRecommendationAccepted(AiRecommendation $recommendation): void
    {
        $recommendation->loadMissing(['demande.formateur.user']);
        $demande = $recommendation->demande;

        if (!$demande) {
            return;
        }

        $this->notificationService->notifyUsersWithRole(
            'commission',
            $recommendation->type === 'multihop'
                ? 'Système de permutation par N accepté'
                : 'Recommandation IA acceptée',
            $recommendation->type === 'multihop'
                ? "Le formateur a accepté une chaîne de permutation par N pour la demande #{$demande->id}. La commission peut valider la demande."
                : "Le formateur a accepté la recommandation IA pour la demande #{$demande->id}.",
            'ai_recommendation',
            [
                'demande_id' => $demande->id,
                'recommendation_id' => $recommendation->id,
                'recommendation_type' => $recommendation->type,
                'recommendation_score' => $recommendation->score,
                'recommendation_confidence' => $recommendation->confidence,
                'recommendation_title' => $recommendation->title,
                'recommendation_summary' => $recommendation->summary,
                'candidate_demande_ids' => $recommendation->candidate_demande_ids,
                'chain' => $recommendation->chain,
                'metadata' => $recommendation->metadata,
                'route' => "/commission/demandes?demande={$demande->id}",
                'action' => 'ai_recommendation_accepted',
            ]
        );
    }

    private function pendingDemandes(): Collection
    {
        return DemandePermutation::with([
            'formateur.user',
            'formateur.etablissement.ville.parent',
            'etat',
            'regionSouhaitee',
            'villeSouhaitee',
            'etablissementSouhaite',
        ])
            ->whereHas('etat', fn ($query) => $query->where('key', 'EN_ATTENTE'))
            ->get();
    }

    private function callAiService(string $path, array $payload): array
    {
        $baseUrl = rtrim((string) config('services.ai.url'), '/');
        if ($baseUrl === '') {
            Log::warning('AI recommendation service URL is not configured.');
            return ['recommendations' => []];
        }

        try {
            $response = Http::timeout((int) config('services.ai.timeout', 5))
                ->acceptJson()
                ->post($baseUrl . $path, $payload);

            if (!$response->successful()) {
                Log::warning('AI recommendation service returned an error.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return ['recommendations' => []];
            }

            return $response->json() ?? ['recommendations' => []];
        } catch (\Throwable $exception) {
            Log::warning('AI recommendation service is unavailable.', [
                'message' => $exception->getMessage(),
            ]);
            return ['recommendations' => []];
        }
    }

    private function selectWorkflowRecommendations(Collection $items, int $maxResults): Collection
    {
        $items = $items
            ->filter(fn ($item) => is_array($item))
            ->sortByDesc(fn (array $item) => (float) ($item['score'] ?? 0))
            ->values();

        foreach (['direct', 'regional', 'multihop'] as $type) {
            $matches = $items->where('type', $type)->values();
            if ($matches->isNotEmpty()) {
                return $type === 'direct' ? $matches->take($maxResults)->values() : $matches->take(1)->values();
            }
        }

        return collect();
    }

    private function buildLocalWorkflowRecommendations(DemandePermutation $demande, Collection $pendingDemandes, int $maxResults): Collection
    {
        $direct = $this->localDirectMatches($demande, $pendingDemandes)
            ->sortByDesc('score')
            ->take($maxResults)
            ->values();

        if ($direct->isNotEmpty()) {
            return $direct;
        }

        $regional = $this->localRegionalMatches($demande, $pendingDemandes)
            ->sortByDesc('score')
            ->take(1)
            ->values();

        if ($regional->isNotEmpty()) {
            return $regional;
        }

        return $this->localMultihopMatches($demande, $pendingDemandes)
            ->sortByDesc('score')
            ->take(1)
            ->values();
    }

    private function localDirectMatches(DemandePermutation $target, Collection $demandes): Collection
    {
        return $demandes
            ->reject(fn (DemandePermutation $candidate) => $candidate->id === $target->id)
            ->filter(function (DemandePermutation $candidate) use ($target) {
                $targetCurrent = $target->formateur?->establishment_id;
                $candidateCurrent = $candidate->formateur?->establishment_id;

                $reciprocalEstablishment = $targetCurrent
                    && $target->etablissement_souhaite_id
                    && $candidateCurrent === $target->etablissement_souhaite_id
                    && $candidate->etablissement_souhaite_id === $targetCurrent;

                $reciprocalCity = $this->currentCityId($target)
                    && $target->ville_souhaitee_id
                    && $this->currentCityId($candidate) === $target->ville_souhaitee_id
                    && $candidate->ville_souhaitee_id === $this->currentCityId($target);

                return $reciprocalEstablishment || $reciprocalCity;
            })
            ->map(fn (DemandePermutation $candidate) => $this->recommendationItem(
                'direct',
                $target,
                [$candidate],
                $this->compatibilityScore($target, $candidate),
                'Permutation directe détectée',
                "{$this->currentCityLabel($target)} -> {$this->parameterLabel($target->villeSouhaitee)} avec {$candidate->formateur?->user?->name}.",
                [
                    $this->chainStep($target),
                    $this->chainStep($candidate),
                ],
                ['reciprocal_establishment' => $candidate->formateur?->establishment_id === $target->etablissement_souhaite_id]
            ))
            ->filter(fn (array $item) => $item['score'] >= 55)
            ->values();
    }

    private function localRegionalMatches(DemandePermutation $target, Collection $demandes): Collection
    {
        return $demandes
            ->reject(fn (DemandePermutation $candidate) => $candidate->id === $target->id)
            ->filter(function (DemandePermutation $candidate) use ($target) {
                if (!$target->region_souhaitee_id || $this->currentRegionId($candidate) !== $target->region_souhaitee_id) {
                    return false;
                }

                $candidateTargetRegion = $candidate->region_souhaitee_id;
                $targetCurrentRegion = $this->currentRegionId($target);

                return !$candidateTargetRegion || !$targetCurrentRegion || $candidateTargetRegion === $targetCurrentRegion;
            })
            ->map(fn (DemandePermutation $candidate) => $this->recommendationItem(
                'regional',
                $target,
                [$candidate],
                $this->compatibilityScore($target, $candidate, regional: true),
                'Opportunité régionale proche',
                "Option compatible dans la région {$this->parameterLabel($target->regionSouhaitee)}, proche de {$this->parameterLabel($target->villeSouhaitee)}.",
                [
                    $this->chainStep($target),
                    $this->chainStep($candidate),
                ],
                ['regional_fallback' => true]
            ))
            ->filter(fn (array $item) => $item['score'] >= 50)
            ->values();
    }

    private function localMultihopMatches(DemandePermutation $target, Collection $demandes, int $maxCycleLength = 4): Collection
    {
        $byId = $demandes->keyBy('id');
        $paths = $this->findCyclesFromTarget($target, $demandes, [$target->id], $maxCycleLength);

        return collect($paths)
            ->map(function (array $cycle) use ($byId, $target) {
                $cycleDemandes = collect($cycle)->map(fn (int $id) => $byId->get($id))->filter()->values();
                if ($cycleDemandes->count() < 3) {
                    return null;
                }

                $scores = [];
                for ($i = 0; $i < $cycleDemandes->count(); $i++) {
                    $scores[] = $this->compatibilityScore($cycleDemandes[$i], $cycleDemandes[($i + 1) % $cycleDemandes->count()]);
                }

                $score = max(round((array_sum($scores) / count($scores)) - (log10($cycleDemandes->count()) * 3), 2), 0);

                return $this->recommendationItem(
                    'multihop',
                    $target,
                    $cycleDemandes->reject(fn (DemandePermutation $item) => $item->id === $target->id)->values()->all(),
                    $score,
                    "Chaîne de permutation à {$cycleDemandes->count()} formateurs",
                    'Cycle circulaire détecté automatiquement par analyse locale.',
                    $cycleDemandes->map(fn (DemandePermutation $item) => $this->chainStep($item))->all(),
                    ['cycle_length' => $cycleDemandes->count()]
                );
            })
            ->filter(fn (?array $item) => $item && $item['score'] >= 50)
            ->values();
    }

    private function findCyclesFromTarget(DemandePermutation $target, Collection $demandes, array $path, int $maxCycleLength): array
    {
        $cycles = [];
        $current = $demandes->firstWhere('id', end($path));
        if (!$current) {
            return [];
        }

        foreach ($demandes as $candidate) {
            if (!$this->edgeIsPossible($current, $candidate)) {
                continue;
            }

            if ($candidate->id === $target->id && count($path) >= 3) {
                $cycles[] = $path;
                continue;
            }

            if (in_array($candidate->id, $path, true) || count($path) >= $maxCycleLength) {
                continue;
            }

            array_push($cycles, ...$this->findCyclesFromTarget($target, $demandes, [...$path, $candidate->id], $maxCycleLength));
        }

        return $cycles;
    }

    private function edgeIsPossible(DemandePermutation $source, DemandePermutation $candidate): bool
    {
        if ($source->id === $candidate->id) {
            return false;
        }

        if (!$source->etablissement_souhaite_id && !$source->ville_souhaitee_id) {
            return false;
        }

        if ($source->etablissement_souhaite_id && $candidate->formateur?->establishment_id === $source->etablissement_souhaite_id) {
            return true;
        }

        return $source->ville_souhaitee_id && $this->currentCityId($candidate) === $source->ville_souhaitee_id;
    }

    private function serializeDemande(DemandePermutation $demande): array
    {
        $formateur = $demande->formateur;
        $currentEtablissement = $formateur?->etablissement;
        $currentCity = $currentEtablissement?->ville;
        $currentRegion = $currentCity?->region;
        $metadata = is_array($formateur?->metadata) ? $formateur->metadata : [];

        return [
            'id' => $demande->id,
            'user_id' => $formateur?->user_id,
            'formateur_id' => $formateur?->id,
            'formateur_name' => $formateur?->user?->name,
            'current_establishment_id' => $formateur?->establishment_id,
            'current_establishment_name' => $currentEtablissement?->name,
            'current_city_id' => $currentCity?->id,
            'current_city_name' => $this->parameterLabel($currentCity),
            'current_region_id' => $currentRegion?->id,
            'current_region_name' => $this->parameterLabel($currentRegion),
            'target_establishment_id' => $demande->etablissement_souhaite_id,
            'target_establishment_name' => $demande->etablissementSouhaite?->name,
            'target_city_id' => $demande->ville_souhaitee_id,
            'target_city_name' => $this->parameterLabel($demande->villeSouhaitee),
            'target_region_id' => $demande->region_souhaitee_id,
            'target_region_name' => $this->parameterLabel($demande->regionSouhaitee),
            'specialty' => $formateur?->specialite,
            'years_experience' => $this->yearsExperience($formateur),
            'urgency' => (int) ($metadata['urgency'] ?? 3),
            'preferences' => $this->payloadObject($metadata['preferences'] ?? []),
            'constraints' => $this->payloadObject($metadata['constraints'] ?? []),
            'history' => $this->payloadObject($metadata['history'] ?? []),
        ];
    }

    private function payloadObject(mixed $value): array|\stdClass
    {
        if (is_array($value) && $value !== [] && ! array_is_list($value)) {
            return $value;
        }

        return new \stdClass();
    }

    private function yearsExperience(?Formateur $formateur): ?float
    {
        if (!$formateur?->hire_date) {
            return null;
        }

        return round($formateur->hire_date->diffInDays(now()) / 365.25, 1);
    }

    private function parameterLabel(?Parametre $parametre): ?string
    {
        $value = $parametre?->value;

        if (is_array($value)) {
            return $value['libelle'] ?? $value['name'] ?? $parametre?->key;
        }

        return $parametre?->key;
    }

    private function currentCityId(DemandePermutation $demande): ?int
    {
        return $demande->formateur?->etablissement?->city_id;
    }

    private function currentCityLabel(DemandePermutation $demande): ?string
    {
        return $this->parameterLabel($demande->formateur?->etablissement?->ville);
    }

    private function currentRegionId(DemandePermutation $demande): ?int
    {
        return $demande->formateur?->etablissement?->ville?->parent?->id;
    }

    private function compatibilityScore(DemandePermutation $source, DemandePermutation $candidate, bool $regional = false): float
    {
        $specialty = $this->specialtySimilarity($source->formateur?->specialite, $candidate->formateur?->specialite);
        $experience = $this->experienceSimilarity($source->formateur, $candidate->formateur);

        $reciprocalCity = $source->ville_souhaitee_id
            && $this->currentCityId($candidate) === $source->ville_souhaitee_id
            && $candidate->ville_souhaitee_id === $this->currentCityId($source);
        $reciprocalEstablishment = $source->etablissement_souhaite_id
            && $candidate->formateur?->establishment_id === $source->etablissement_souhaite_id
            && $candidate->etablissement_souhaite_id === $source->formateur?->establishment_id;
        $destination = $reciprocalEstablishment ? 1.0 : ($reciprocalCity ? 0.88 : 0.58);

        $sameRegion = $source->region_souhaitee_id && $this->currentRegionId($candidate) === $source->region_souhaitee_id;
        $region = $regional && $sameRegion ? 0.92 : ($sameRegion ? 1.0 : 0.55);

        $sourceUrgency = max(min((int) (($source->formateur?->metadata['urgency'] ?? 3)), 5), 1);
        $candidateUrgency = max(min((int) (($candidate->formateur?->metadata['urgency'] ?? 3)), 5), 1);
        $urgency = 1 - abs($sourceUrgency - $candidateUrgency) / 5;

        $acceptance = (float) ($candidate->formateur?->metadata['history']['acceptance_rate'] ?? 0.65);
        $acceptance = min(max($acceptance, 0.15), 0.98);

        $score = $specialty * 0.28
            + $destination * 0.24
            + $region * 0.16
            + $experience * 0.12
            + $urgency * 0.08
            + $acceptance * 0.12;

        return round(max(min($score, 1), 0) * 100, 2);
    }

    private function specialtySimilarity(?string $left, ?string $right): float
    {
        $left = $this->normalizeSpecialite($left);
        $right = $this->normalizeSpecialite($right);

        if ($left === '' || $right === '') {
            return 0.75;
        }

        if ($left === $right) {
            return 1.0;
        }

        if (str_contains($left, $right) || str_contains($right, $left)) {
            return 0.9;
        }

        similar_text($left, $right, $percent);

        return round($percent / 100, 3);
    }

    private function normalizeSpecialite(?string $value): string
    {
        return Str::of((string) $value)
            ->ascii()
            ->lower()
            ->squish()
            ->toString();
    }

    private function experienceSimilarity(?Formateur $source, ?Formateur $candidate): float
    {
        $sourceYears = $this->yearsExperience($source);
        $candidateYears = $this->yearsExperience($candidate);

        if ($sourceYears === null || $candidateYears === null) {
            return 0.72;
        }

        return max(0.35, 1 - min(abs($sourceYears - $candidateYears), 20) / 20);
    }

    private function recommendationItem(
        string $type,
        DemandePermutation $target,
        array $candidates,
        float $score,
        string $title,
        string $summary,
        array $chain,
        array $metadata = []
    ): array {
        return [
            'type' => $type,
            'target_demande_id' => $target->id,
            'candidate_demande_ids' => array_values(array_map(fn (DemandePermutation $candidate) => $candidate->id, $candidates)),
            'score' => $score,
            'confidence' => $this->confidenceFromScore($score),
            'title' => $title,
            'summary' => $summary,
            'chain' => $chain,
            'metadata' => [
                ...$metadata,
                'local_fallback' => true,
            ],
        ];
    }

    private function chainStep(DemandePermutation $demande): array
    {
        return [
            'demande_id' => $demande->id,
            'from' => $this->currentCityLabel($demande),
            'to' => $this->parameterLabel($demande->villeSouhaitee),
        ];
    }

    private function confidenceFromScore(float $score): string
    {
        if ($score >= 82) {
            return 'high';
        }

        if ($score >= 62) {
            return 'medium';
        }

        return 'low';
    }

    private function persistRecommendation(DemandePermutation $demande, array $item): ?AiRecommendation
    {
        $candidateIds = $item['candidate_demande_ids'] ?? [];
        $chain = $item['chain'] ?? [];
        $signature = md5(json_encode([$item['type'] ?? null, $candidateIds, $chain]));

        $recommendation = AiRecommendation::firstOrNew([
            'demande_permutation_id' => $demande->id,
            'signature' => $signature,
        ]);

        $recommendation->fill([
            'type' => $item['type'] ?? 'direct',
            'score' => $item['score'] ?? 0,
            'confidence' => $item['confidence'] ?? 'medium',
            'title' => $item['title'] ?? 'Recommandation IA',
            'summary' => $item['summary'] ?? null,
            'candidate_demande_ids' => $candidateIds,
            'chain' => $chain,
            'metadata' => [
                ...($item['metadata'] ?? []),
                'signature' => $signature,
                'source' => ($item['metadata']['local_fallback'] ?? false) ? 'laravel-fallback' : 'ai-microservice',
            ],
            'status' => $recommendation->exists ? $recommendation->status : 'proposed',
        ]);
        $recommendation->save();

        return $recommendation;
    }

    private function notifyRecommendationAvailable(DemandePermutation $demande, Collection $recommendations): void
    {
        $best = $recommendations->sortByDesc('score')->first();
        $formateurUser = $demande->formateur?->user;

        if ($formateurUser) {
            $this->notificationService->notify(
                $formateurUser->id,
                $best->type === 'direct'
                    ? 'Permutation directe trouvée'
                    : ($best->type === 'multihop' ? 'Permutation par N possible' : 'Recommandation IA proche trouvée'),
                $best->type === 'direct'
                    ? "Une correspondance directe a été trouvée pour votre demande #{$demande->id}. Meilleur score: {$best->score}%."
                    : ($best->type === 'multihop'
                        ? "Une chaîne de permutation par N est possible pour votre demande #{$demande->id}. Vous pouvez l'accepter ou la refuser."
                        : "Une recommandation proche basée sur la région et la spécialité a été trouvée pour votre demande #{$demande->id}. Meilleur score: {$best->score}%."),
                'ai_recommendation',
                [
                    'demande_id' => $demande->id,
                    'recommendation_id' => $best->id,
                    'recommendation_type' => $best->type,
                    'route' => '/formateur',
                ]
            );
        }

        if ($best->type !== 'multihop') {
            $this->notificationService->notifyUsersWithRole(
                'commission',
                $best->type === 'direct' ? 'Permutation directe détectée' : 'Recommandation IA détectée',
                $best->type === 'direct'
                    ? "Une correspondance directe a été trouvée pour la demande #{$demande->id}."
                    : "Une recommandation proche a été générée pour la demande #{$demande->id}.",
                'ai_recommendation',
                [
                    'demande_id' => $demande->id,
                    'recommendation_id' => $best->id,
                    'recommendation_type' => $best->type,
                    'route' => "/commission/demandes?demande={$demande->id}",
                ]
            );
        }
    }
}
