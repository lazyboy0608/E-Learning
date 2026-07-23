<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StudentJoinedClassNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $className
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Tham gia lớp học',
            'message' => "Bạn đã tham gia lớp {$this->className}",
            'type' => 'join_class'
        ];
    }
}