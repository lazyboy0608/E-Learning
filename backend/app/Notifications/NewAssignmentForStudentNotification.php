<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewAssignmentForStudentNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $assignmentName,
        public string $teacherName,
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
            'message' => "Giáo viên {$this->teacherName} đã giao bài mới",
            'type' => 'new_assignment',
            'data' => [
                'assignment_name' => $this->assignmentName,
                'teacher_name' => $this->teacherName,
                'assignment_type' => $this->type,
            ]
        ];
    }
}
