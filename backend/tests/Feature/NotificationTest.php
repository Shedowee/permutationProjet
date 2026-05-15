<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Role;
use App\Models\RoleCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $roleCode = 'admin'): User
    {
        $category = RoleCategory::firstOrCreate(['name' => 'TEST']);
        $role = Role::firstOrCreate(
            ['code' => $roleCode],
            [
                'name' => strtoupper($roleCode),
                'role_category_id' => $category->id,
            ]
        );

        return User::factory()->create([
            'role_id' => $role->id,
            'status' => 'active',
        ]);
    }

    public function test_user_can_list_visible_notifications(): void
    {
        $user = $this->userWithRole('admin');
        $otherUser = $this->userWithRole('commission');

        $visible = Notification::create([
            'user_id' => $user->id,
            'type' => 'system',
            'payload' => [
                'title' => 'Visible',
                'message' => 'This should be returned.',
                'target_role' => 'admin',
            ],
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'system',
            'payload' => [
                'title' => 'Wrong role',
                'message' => 'This should be hidden.',
                'target_role' => 'commission',
            ],
        ]);

        Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'system',
            'payload' => [
                'title' => 'Other user',
                'message' => 'This should be hidden.',
            ],
        ]);

        $this->actingAs($user)
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $visible->id)
            ->assertJsonPath('data.0.payload.title', 'Visible');
    }

    public function test_user_can_mark_notification_read_and_count_updates(): void
    {
        $user = $this->userWithRole('admin');
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'system',
            'payload' => [
                'title' => 'Unread',
                'message' => 'This starts unread.',
            ],
        ]);

        $this->actingAs($user)
            ->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('count', 1);

        $this->actingAs($user)
            ->putJson("/api/notifications/{$notification->id}/read")
            ->assertOk();

        $this->actingAs($user)
            ->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('count', 0);
    }
}
