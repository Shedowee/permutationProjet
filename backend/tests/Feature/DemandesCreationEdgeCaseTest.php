<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\RoleCategory;
use App\Models\Parametre;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class DemandesCreationEdgeCaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_creation_fails_when_employe_record_missing(): void
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
            'username' => 'no.employe',
            'nom' => 'Sans Employe',
            'email' => 'no.employe@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $role->id,
            'actif' => true,
        ]);

        Parametre::create([
            'type' => 'ETAT',
            'code' => 'EN_ATTENTE',
            'libelle' => 'En attente',
            'actif' => true,
            'ordre' => 1,
        ]);

        $region = Parametre::create([
            'type' => 'REGION',
            'code' => 'CASA',
            'libelle' => 'Casablanca-Settat',
            'actif' => true,
            'ordre' => 1,
        ]);

        $etab = \App\Models\Etablissement::create([
            'code' => 'ETAB010',
            'nom' => 'Institut Casablanca',
            'adresse' => 'Casablanca',
            'actif' => true,
        ]);

        $payload = [
            'motif' => 'Doit échouer',
            'region_souhaitee_id' => $region->id,
            'etablissement_souhaite_id' => $etab->id,
        ];

        $this->actingAs($user);
        $response = $this->postJson('/api/demandes', $payload);
        $response->assertStatus(422);
        $response->assertJson(['message' => 'Employe not found']);
    }
}
