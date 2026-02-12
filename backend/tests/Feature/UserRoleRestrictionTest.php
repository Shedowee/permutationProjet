<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\RoleCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleRestrictionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create basic role category
        $category = RoleCategory::create(['code' => 'METIER', 'libelle' => 'Métier']);
        
        // Create basic roles
        Role::create(['code' => 'USER', 'libelle' => 'User', 'role_category_id' => $category->id]);
        Role::create(['code' => 'ADMIN', 'libelle' => 'Admin', 'role_category_id' => $category->id]);
    }

    public function test_user_role_can_access_profile(): void
    {
        $role = Role::where('code', 'USER')->first();
        $user = User::factory()->create(['role_id' => $role->id, 'actif' => true]);

        $response = $this->actingAs($user)->getJson('/api/me');

        $response->assertStatus(200);
    }

    public function test_user_role_cannot_access_restricted_endpoints(): void
    {
        $role = Role::where('code', 'USER')->first();
        $user = User::factory()->create(['role_id' => $role->id, 'actif' => true]);

        $response = $this->actingAs($user)->getJson('/api/parametres');

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Accès restreint. Votre compte est en attente d\'activation par un administrateur.'
        ]);
    }

    public function test_signup_assigns_user_role_by_default(): void
    {
        $response = $this->postJson('/api/signup', [
            'nom' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('utilisateurs', [
            'email' => 'test@example.com',
            'role_id' => Role::where('code', 'USER')->first()->id
        ]);
    }
}
