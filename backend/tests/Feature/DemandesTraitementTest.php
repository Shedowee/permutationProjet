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

class DemandesTraitementTest extends TestCase
{
    use RefreshDatabase;

    public function test_commission_can_traiter_demande_and_updates_are_saved(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        $catAdmin = RoleCategory::create(['code' => 'ADMIN', 'libelle' => 'Administration']);
        $catMetier = RoleCategory::create(['code' => 'METIER', 'libelle' => 'Métier']);

        $roleEmploye = Role::create([
            'libelle' => 'Employé',
            'code' => 'EMPLOYE',
            'role_category_id' => $catMetier->id,
        ]);
        $roleCommission = Role::create([
            'libelle' => 'Commission',
            'code' => 'COMISSION',
            'role_category_id' => $catAdmin->id,
        ]);

        $employeUser = User::create([
            'username' => 'employe.test',
            'nom' => 'Employe Test',
            'email' => 'employe.test@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleEmploye->id,
            'actif' => true,
        ]);
        $commissionUser = User::create([
            'username' => 'commission.test',
            'nom' => 'Commission Test',
            'email' => 'commission.test@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleCommission->id,
            'actif' => true,
        ]);

        $employe = Employe::create([
            'nom' => 'Employe',
            'prenom' => 'Test',
            'user_id' => $employeUser->id,
        ]);

        $etatEnAttente = Parametre::create([
            'type' => 'ETAT',
            'code' => 'EN_ATTENTE',
            'libelle' => 'En attente',
            'actif' => true,
            'ordre' => 1,
        ]);
        $etatValide = Parametre::create([
            'type' => 'ETAT',
            'code' => 'VALIDE',
            'libelle' => 'Validé',
            'actif' => true,
            'ordre' => 2,
        ]);

        $demande = DemandePermutation::create([
            'motif' => 'Test traitement',
            'etat_id' => $etatEnAttente->id,
            'employe_id' => $employe->id,
        ]);

        $this->actingAs($commissionUser);

        $response = $this->putJson("/api/demandes/{$demande->id}", [
            'etat_code' => 'VALIDE',
            'commentaire_commission' => 'Approuvée',
        ]);

        $response->assertStatus(200);
        $demande->refresh();

        $this->assertEquals($etatValide->id, $demande->etat_id);
        $this->assertNotNull($demande->date_traitement);
        $this->assertEquals($commissionUser->id, $demande->traite_par_utilisateur_id);
        $this->assertEquals('Approuvée', $demande->commentaire_commission);
    }
}

