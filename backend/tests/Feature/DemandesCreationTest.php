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

class DemandesCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_employe_can_create_demande_and_record_is_saved(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        $category = RoleCategory::create([
            'code' => 'METIER',
            'libelle' => 'Métier',
        ]);

        $role = Role::create([
            'libelle' => 'Employé',
            'code' => 'EMPLOYE',
            'role_category_id' => $category->id,
        ]);

        $user = User::create([
            'username' => 'employe.test',
            'nom' => 'Employe Test',
            'email' => 'employe.test@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $role->id,
            'actif' => true,
        ]);

        $employe = Employe::create([
            'nom' => 'Employe',
            'prenom' => 'Test',
            'user_id' => $user->id,
        ]);

        $etatEnAttente = Parametre::create([
            'type' => 'ETAT',
            'code' => 'EN_ATTENTE',
            'libelle' => 'En attente',
            'actif' => true,
            'ordre' => 1,
        ]);

        $payload = [
            'motif' => 'Test de création',
            'region_souhaitee_id' => null,
            'etablissement_souhaite_id' => null,
        ];

        $this->actingAs($user);

        $response = $this->postJson('/api/demandes', $payload);
        $response->assertStatus(201);

        $this->assertDatabaseHas('demande_permutations', [
            'employe_id' => $employe->id,
            'motif' => 'Test de création',
            'etat_id' => $etatEnAttente->id,
        ]);

        $demande = DemandePermutation::first();
        $this->assertNotNull($demande);
        $this->assertEquals($employe->id, $demande->employe_id);
    }
}

