<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseInstallationTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_can_migrate_and_seed_core_data(): void
    {
        $this->seed();

        $this->assertDatabaseHas('roles', ['code' => 'admin']);
        $this->assertDatabaseHas('roles', ['code' => 'commission']);
        $this->assertDatabaseHas('roles', ['code' => 'formateur']);
        $this->assertDatabaseHas('permissions', ['name' => 'read_demandes']);
        $this->assertDatabaseHas('parametres', ['type' => 'ETAT', 'key' => 'EN_ATTENTE']);
        $this->assertGreaterThan(0, DB::table('etablissement_formateur')->count());
    }
}
