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

class DemandesAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_employe_cannot_update_demande(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        $catAdmin = RoleCategory::create(['code' => 'ADMIN', 'libelle' => 'Administration']);
        $catMetier = RoleCategory::create(['code' => 'METIER', 'libelle' => 'Métier']);

        $roleEmploye = Role::create([
            'libelle' => 'Employé',
            'code' => 'EMPLOYE',
            'role_category_id' => $catMetier->id,
        ]);

        $employeUser = User::create([
            'username' => 'employe.test',
            'nom' => 'Employe Test',
            'email' => 'employe.test@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleEmploye->id,
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

        $this->actingAs($employeUser);

        $response = $this->putJson("/api/demandes/{$demande->id}", [
            'etat_code' => 'VALIDE',
            'commentaire_commission' => 'Approuvée',
        ]);

        $response->assertStatus(403);
        $demande->refresh();
        $this->assertEquals($etatEnAttente->id, $demande->etat_id);
        $this->assertNull($demande->date_traitement);
        $this->assertNull($demande->traite_par_utilisateur_id);
    }
}

