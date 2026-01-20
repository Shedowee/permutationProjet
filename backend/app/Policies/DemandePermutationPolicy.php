<?php

namespace App\Policies;

use App\Models\User;
use App\Models\DemandePermutation;

class DemandePermutationPolicy
{
    public function update(User $user, DemandePermutation $demande): bool
    {
        $code = $user->role ? $user->role->code : null;
        return in_array($code, ['COMISSION', 'ADMIN']);
    }
}

