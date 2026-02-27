<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserActionOccurred
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ?int $userId;
    public string $actionType;
    public string $description;
    public array $metadata;

    /**
     * Create a new event instance.
     */
    public function __construct(?int $userId, string $actionType, string $description, array $metadata = [])
    {
        $this->userId = $userId;
        $this->actionType = $actionType;
        $this->description = $description;
        $this->metadata = $metadata;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
