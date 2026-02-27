<?php

namespace App\Listeners;

use App\Events\UserActionOccurred;
use App\Services\ActivityLogService;

class LogUserAction
{
    protected ActivityLogService $logService;

    /**
     * Create the event listener.
     */
    public function __construct(ActivityLogService $logService)
    {
        $this->logService = $logService;
    }

    /**
     * Handle the event.
     */
    public function handle(UserActionOccurred $event): void
    {
        $this->logService->log(
            $event->userId,
            $event->actionType,
            $event->description
        );
    }
}
