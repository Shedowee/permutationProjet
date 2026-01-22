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
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class DemandesCreationAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_commission_cannot_create_demande(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        $category = RoleCategory::create([
            'code' => 'METIER',
            'libelle' => 'Métier',
        ]);

        $roleCommission = Role::create([
            'libelle' => 'Commission',
            'code' => 'COMISSION',
            'role_category_id' => $category->id,
        ]);

        $userCommission = User::create([
            'username' => 'commission.test',
            'nom' => 'Commission Test',
            'email' => 'commission.test@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleCommission->id,
            'actif' => true,
        ]);

        Parametre::create([
            'type' => 'ETAT',
            'code' => 'EN_ATTENTE',
            'libelle' => 'En attente',
            'actif' => true,
            'ordre' => 1,
        ]);

        $payload = [
            'motif' => 'Tentative par commission',
            'region_souhaitee_id' => null,
            'etablissement_souhaite_id' => null,
        ];

        $this->actingAs($userCommission);
        $response = $this->postJson('/api/demandes', $payload);
        $response->assertStatus(403);
    }

    public function test_admin_cannot_create_demande(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        $category = RoleCategory::create([
            'code' => 'METIER',
            'libelle' => 'Métier',
        ]);

        $roleAdmin = Role::create([
            'libelle' => 'Administrateur',
            'code' => 'ADMIN',
            'role_category_id' => $category->id,
        ]);

        $userAdmin = User::create([
            'username' => 'admin.test',
            'nom' => 'Admin Test',
            'email' => 'admin.test@ofppt.ma',
            'mot_de_passe' => Hash::make('Password123!'),
            'role_id' => $roleAdmin->id,
            'actif' => true,
        ]);

        Parametre::create([
            'type' => 'ETAT',
            'code' => 'EN_ATTENTE',
            'libelle' => 'En attente',
            'actif' => true,
            'ordre' => 1,
        ]);

        $payload = [
            'motif' => 'Tentative par admin',
            'region_souhaitee_id' => null,
            'etablissement_souhaite_id' => null,
        ];

        $this->actingAs($userAdmin);
        $response = $this->postJson('/api/demandes', $payload);
        $response->assertStatus(403);
    }
}
