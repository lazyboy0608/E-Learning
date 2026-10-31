<?php

namespace App\Observers;

use App\Models\ClassUser;
use App\Notifications\StudentJoinedClassNotification;
use App\Notifications\NewStudentJoinedNotification;
use App\Events\NotificationCreated;

class ClassUserObserver
{
    public function created(ClassUser $classUser): void
    {
        if ($classUser->role !== 'student') {
            return;
        }

        $classUser->load([
            'user',
            'class.creator'
        ]);

        $student = $classUser->user;
        $teacher = $classUser->class->creator;

        $className = $classUser->class->name;

        /*
        |------------------------------------
        | Notification cho học sinh
        |------------------------------------
        */

        $student->notify(
            new StudentJoinedClassNotification(
                $className
            )
        );

        event(
            new NotificationCreated(
                $student->id
            )
        );
        /*
        |------------------------------------
        | Thông báo bảng tin lớp học (Class Announcement Feed)
        |------------------------------------
        */
        $announcement = \App\Models\ClassAnnouncement::create([
            'class_id' => $classUser->class_id,
            'author_id' => $student->id,
            'type' => 'student_joined',
            'title' => 'Thành viên mới',
            'content' => "Chào mừng bạn {$student->name} gia nhập lớp học!",
            'data' => [
                'student_id' => $student->id,
                'student_name' => $student->name,
            ],
        ]);

        event(new \App\Events\ClassFeedUpdated($classUser->class_id, $announcement));

        /*
        |------------------------------------
        | Notification cho giáo viên
        |------------------------------------
        */

        $teacher->notify(
            new NewStudentJoinedNotification(
                $student->name,
                $className
            )
        );

        event(
            new NotificationCreated(
                $teacher->id
            )
        );
    }
}