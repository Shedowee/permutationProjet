<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Resolve users for a single role code.
     *
     * @return \Illuminate\Support\Collection<int, \App\Models\User>
     */
    private function usersForRole(string $roleCode)
    {
        return User::whereHas('role', function ($query) use ($roleCode) {
            $query->where('code', $roleCode);
        })->get();
    }

    /**
     * Send a notification to a specific user.
     *
     * @param int $userId
     * @param string $title
     * @param string $message
     * @param string $type
     * @return Notification
     */
    public function notify(int $userId, string $title, string $message, string $type = 'info', array $payload = []): Notification
    {
        $user = User::with('role')->find($userId);

        if (!$user) {
            throw new \InvalidArgumentException("Unknown user id {$userId}.");
        }

        return $this->notifyUser($user, $title, $message, $type, $payload);
    }

    public function notifyUser(User $user, string $title, string $message, string $type = 'info', array $payload = []): Notification
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'payload' => [
                'title' => $title,
                'message' => $message,
                ...Notification::normalizePayloadForRecipient($payload, $user),
            ],
            'read_at' => null,
        ]);

        event(new NotificationCreated($notification->load('user.role')));

        return $notification;
    }

    /**
     * Send a notification to every user in a role.
     *
     * @param string $roleCode
     * @param string $title
     * @param string $message
     * @param string $type
     * @return void
     */
    public function notifyRole(string $roleCode, string $title, string $message, string $type = 'system', array $payload = []): void
    {
        foreach ($this->usersForRole($roleCode) as $user) {
            $this->notifyUser($user, $title, $message, $type, [
                'target_role' => $roleCode,
                ...$payload,
            ]);
        }
    }

    /**
     * Notify all admins.
     */
    public function notifyAdmins(string $title, string $message, string $type = 'system', array $payload = []): void
    {
        $this->notifyRole('admin', $title, $message, $type, $payload);
    }

    public function notifyUsersWithRole(string $roleCode, string $title, string $message, string $type = 'system', array $payload = []): void
    {
        $this->notifyRole($roleCode, $title, $message, $type, $payload);
    }

    public function notifyUsersWithPermission(string $permission, string $title, string $message, string $type = 'system', array $payload = []): void
    {
        $users = User::whereHas('role.permissions', function ($query) use ($permission) {
            $query->where('name', $permission);
        })->get();

        foreach ($users as $user) {
            $this->notify($user->id, $title, $message, $type, $payload);
        }
    }
}
