<?php

namespace App\Policies;

use App\Models\User;
use App\Models\DemandePermutation;

class DemandePermutationPolicy
{
    public function create(User $user): bool
    {
        return $user->hasPermission('create_demandes');
    }

    public function update(User $user, DemandePermutation $demande): bool
    {
        $reviewing = request()->filled('etat_code');

        if ($reviewing) {
            return $user->role?->code === 'commission';
        }

        if (!$user->hasPermission('create_demandes')) {
            return false;
        }

        $formateur = $user->formateur;
        if (!$formateur) {
            return false;
        }

        return $demande->formateur_id === $formateur->id && $demande->etat?->key === 'EN_ATTENTE';
    }

    public function delete(User $user, DemandePermutation $demande): bool
    {
        if (!$user->hasPermission('create_demandes')) {
            return false;
        }

        $formateur = $user->formateur;
        if (!$formateur) {
            return false;
        }

        return $demande->formateur_id === $formateur->id && $demande->etat?->key === 'EN_ATTENTE';
    }
}
