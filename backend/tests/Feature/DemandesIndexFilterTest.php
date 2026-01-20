<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\RoleCategory;
use App\Models\Employe;
use App\Models\Parametre;
use App\Models\DemandePermutation;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class DemandesIndexFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_employe_sees_only_own_demandes(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        $catMetier = RoleCategory::create(['code' => 'METIER', 'libelle' => 'Métier']);
        $roleEmploye = Role::create([
            'libelle' => 'Employé',
            'code' => 'EMPLOYE',
            'role_category_id' => $catMetier->id,
        ]);

        $etatEnAttente = Parametre::create([
            'type' => 'ETAT',
            'code' => 'EN_ATTENTE',
            'libelle' => 'En attente',
            'actif' => true,
            'ordre' => 1,
        ]);

        $userA = User::create([
            'username' => 'emp.a',
            'nom' => 'Employe A',
            'email' => 'a@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleEmploye->id,
            'actif' => true,
        ]);
        $userB = User::create([
            'username' => 'emp.b',
            'nom' => 'Employe B',
            'email' => 'b@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleEmploye->id,
            'actif' => true,
        ]);

        $empA = Employe::create(['nom' => 'A', 'prenom' => 'Test', 'user_id' => $userA->id]);
        $empB = Employe::create(['nom' => 'B', 'prenom' => 'Test', 'user_id' => $userB->id]);

        DemandePermutation::create(['motif' => 'A1', 'etat_id' => $etatEnAttente->id, 'employe_id' => $empA->id]);
        DemandePermutation::create(['motif' => 'A2', 'etat_id' => $etatEnAttente->id, 'employe_id' => $empA->id]);
        DemandePermutation::create(['motif' => 'B1', 'etat_id' => $etatEnAttente->id, 'employe_id' => $empB->id]);

        $this->actingAs($userA);
        $res = $this->getJson('/api/demandes')->assertStatus(200)->json('data');

        $motifs = collect($res)->pluck('motif')->all();
        $this->assertEqualsCanonicalizing(['A1', 'A2'], $motifs);
    }

    public function test_commission_sees_all_demandes(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        $catAdmin = RoleCategory::create(['code' => 'ADMIN', 'libelle' => 'Administration']);
        $catMetier = RoleCategory::create(['code' => 'METIER', 'libelle' => 'Métier']);

        $roleCommission = Role::create([
            'libelle' => 'Commission',
            'code' => 'COMISSION',
            'role_category_id' => $catAdmin->id,
        ]);
        $roleEmploye = Role::create([
            'libelle' => 'Employé',
            'code' => 'EMPLOYE',
            'role_category_id' => $catMetier->id,
        ]);

        $etatEnAttente = Parametre::create([
            'type' => 'ETAT',
            'code' => 'EN_ATTENTE',
            'libelle' => 'En attente',
            'actif' => true,
            'ordre' => 1,
        ]);

        $commissionUser = User::create([
            'username' => 'commission.test',
            'nom' => 'Commission Test',
            'email' => 'commission.test@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleCommission->id,
            'actif' => true,
        ]);

        $userA = User::create([
            'username' => 'emp.a',
            'nom' => 'Employe A',
            'email' => 'a@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleEmploye->id,
            'actif' => true,
        ]);
        $userB = User::create([
            'username' => 'emp.b',
            'nom' => 'Employe B',
            'email' => 'b@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleEmploye->id,
            'actif' => true,
        ]);

        $empA = Employe::create(['nom' => 'A', 'prenom' => 'Test', 'user_id' => $userA->id]);
        $empB = Employe::create(['nom' => 'B', 'prenom' => 'Test', 'user_id' => $userB->id]);

        DemandePermutation::create(['motif' => 'A1', 'etat_id' => $etatEnAttente->id, 'employe_id' => $empA->id]);
        DemandePermutation::create(['motif' => 'B1', 'etat_id' => $etatEnAttente->id, 'employe_id' => $empB->id]);

        $this->actingAs($commissionUser);
        $res = $this->getJson('/api/demandes')->assertStatus(200)->json('data');

        $motifs = collect($res)->pluck('motif')->all();
        $this->assertEqualsCanonicalizing(['A1', 'B1'], $motifs);
    }
}

