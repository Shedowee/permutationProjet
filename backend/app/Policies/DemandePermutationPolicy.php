<?php

namespace App\Policies;

use App\Models\User;
use App\Models\DemandePermutation;

class DemandePermutationPolicy
{
    public function create(User $user): bool
    {
        if (!$user->actif) {
            return false;
        }
        $code = $user->role ? $user->role->code : null;
        return in_array($code, ['FORMATEUR', 'EMPLOYE']);
    }

    public function update(User $user, DemandePermutation $demande): bool
    {
        $code = $user->role ? $user->role->code : null;
        return in_array($code, ['COMMISSION', 'ADMIN']);
    }
}
