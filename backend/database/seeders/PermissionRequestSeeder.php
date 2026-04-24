<?php

namespace Database\Seeders;

use App\Models\PermissionRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class PermissionRequestSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'h.majdoub@ofppt.ma')->first();
        $commission = User::where('email', 'a.alaoui@ofppt.ma')->first();
        $admin = User::where('email', 'admin@ofppt.ma')->first();

        $rows = [
            [
                'user_id' => $user?->id,
                'type' => 'create_demandes',
                'status' => 'pending',
            ],
            [
                'user_id' => $commission?->id,
                'type' => 'read_permission_requests',
                'status' => 'approved',
                'reviewed_by' => $admin?->id,
                'reviewed_at' => now()->subDays(2),
            ],
            [
                'user_id' => $user?->id,
                'type' => 'create_permission_requests',
                'status' => 'rejected',
                'reviewed_by' => $admin?->id,
                'reviewed_at' => now()->subDay(),
            ],
        ];

        foreach ($rows as $row) {
            if (!$row['user_id']) {
                continue;
            }

            PermissionRequest::updateOrCreate(
                [
                    'user_id' => $row['user_id'],
                    'type' => $row['type'],
                    'status' => $row['status'],
                ],
                $row
            );
        }
    }
}
