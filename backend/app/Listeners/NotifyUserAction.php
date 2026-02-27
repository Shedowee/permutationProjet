<?php

namespace App\Listeners;

use App\Events\UserActionOccurred;
use App\Services\NotificationService;

class NotifyUserAction
{
    protected NotificationService $notificationService;

    /**
     * Create the event listener.
     */
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(UserActionOccurred $event): void
    {
        // Only notify for specific important actions
        $importantActions = [
            'registration' => ['title' => 'Bienvenue !', 'type' => 'account'],
            'email_verified' => ['title' => 'Email vérifié', 'type' => 'account'],
            'password_change' => ['title' => 'Mot de passe modifié', 'type' => 'security'],
            'role_change' => ['title' => 'Changement de rôle', 'type' => 'system'],
        ];

        if (isset($importantActions[$event->actionType]) && $event->userId) {
            $this->notificationService->notify(
                $event->userId,
                $importantActions[$event->actionType]['title'],
                $event->description,
                $importantActions[$event->actionType]['type']
            );
        }
        
        // Also notify admins for system-level alerts
        if ($event->actionType === 'role_change' || $event->actionType === 'registration') {
            $this->notificationService->notifyAdmins(
                "Alerte Système: " . $event->actionType,
                $event->description
            );
        }
    }
}
