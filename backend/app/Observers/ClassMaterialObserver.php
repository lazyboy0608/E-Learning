<?php

namespace App\Observers;

use App\Events\ClassFeedUpdated;
use App\Events\NotificationCreated;
use App\Models\ClassAnnouncement;
use App\Models\ClassMaterial;
use Illuminate\Notifications\Notification;

class ClassMaterialObserver
{
    public function created(ClassMaterial $material): void
    {
        $material->load(['class.students', 'class.creator', 'class.teachers']);

        $class = $material->class;
        if (!$class) {
            return;
        }

        $currentUserId = auth()->id();
        $author = $currentUserId ? \App\Models\User::find($currentUserId) : ($class->teachers->first() ?? $class->creator);
        $authorName = $author ? $author->name : 'Giáo viên';
        $authorId = $author ? $author->id : $class->created_by;

        $content = "Giáo viên {$authorName} vừa đăng tải tài liệu học tập mới: {$material->title}";

        // 1. Tạo thông báo trong bảng tin lớp học (Class Announcement)
        $announcement = ClassAnnouncement::create([
            'class_id' => $class->id,
            'author_id' => $authorId,
            'type' => 'material',
            'title' => 'Tài liệu học tập mới',
            'content' => $content,
            'data' => [
                'material_id' => $material->id,
                'title' => $material->title,
                'file_url' => $material->file_url,
                'type' => $material->type,
                'file_size' => $material->file_size,
                'original_name' => $material->original_name,
            ],
        ]);

        // 2. Phát WebSocket Real-time trên kênh của lớp học
        event(new ClassFeedUpdated($class->id, $announcement));

        // 3. Gửi thông báo đến quả chuông của từng học sinh trong lớp
        $students = $class->students;
        foreach ($students as $student) {
            $student->notify(new class($material->title, $authorName, $class->name) extends Notification {
                public function __construct(
                    public string $materialTitle,
                    public string $teacherName,
                    public string $className
                ) {}

                public function via($notifiable): array
                {
                    return ['database'];
                }

                public function toArray($notifiable): array
                {
                    return [
                        'title' => 'Tài liệu học tập mới',
                        'message' => "Giáo viên {$this->teacherName} vừa đăng tải tài liệu: {$this->materialTitle} trong lớp {$this->className}",
                        'type' => 'new_material',
                        'data' => [
                            'material_title' => $this->materialTitle,
                            'teacher_name' => $this->teacherName,
                            'class_name' => $this->className,
                        ],
                    ];
                }
            });

            event(new NotificationCreated($student->id));
        }
    }
}

