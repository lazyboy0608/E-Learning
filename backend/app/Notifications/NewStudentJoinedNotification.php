<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewStudentJoinedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $studentName,
        public string $className
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Học sinh mới',
            'message' => "{$this->studentName} vừa tham gia lớp {$this->className}",
            'type' => 'new_student'
        ];
    }
}