<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@ofppt.ma')->first();
        if ($adminUser) {
            Admin::updateOrCreate(
                ['user_id' => $adminUser->id],
                [
                    'admin_level' => 5,
                    'notes' => 'Super admin en charge du réseau national',
                    'metadata' => [],
                ]
            );
        }
    }
}
