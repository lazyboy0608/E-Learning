<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AssignmentCreatedByTeacherNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $assignmentName,
        public string $className,
        public string $type
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $typeLabel = $this->type === 'test' ? 'Bài kiểm tra mới' : 'Bài ôn tập mới';

        return [
            'title' => $typeLabel,
            'message' => "Bạn đã giao bài cho lớp {$this->className}",
            'type' => 'assignment_created',
            'data' => [
                'assignment_name' => $this->assignmentName,
                'class_name' => $this->className,
                'assignment_type' => $this->type,
            ]
        ];
    }
}
