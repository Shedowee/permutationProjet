<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Send a notification to a specific user.
     *
     * @param int $userId
     * @param string $title
     * @param string $message
     * @param string $type
     * @return Notification
     */
    public function notify(int $userId, string $title, string $message, string $type = 'info'): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'is_read' => false,
        ]);
    }

    /**
     * Notify all admins.
     *
     * @param string $title
     * @param string $message
     * @param string $type
     * @return void
     */
    public function notifyAdmins(string $title, string $message, string $type = 'system'): void
    {
        // Assuming role_id for admin is 1 or name is 'admin'
        // Need to check how roles are structured
        $admins = User::whereHas('role', function($query) {
            $query->where('nom', 'admin');
        })->get();

        foreach ($admins as $admin) {
            $this->notify($admin->id, $title, $message, $type);
        }
    }
}
