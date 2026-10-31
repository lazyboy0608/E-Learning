<?php

namespace App\Events;

use App\Models\ClassAnnouncement;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClassFeedUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $classId,
        public ClassAnnouncement $announcement
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("classes.{$this->classId}")
        ];
    }

    public function broadcastAs(): string
    {
        return 'class.feed.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'class_id' => $this->classId,
            'announcement' => $this->announcement->load('author:id,name,role'),
        ];
    }
}

