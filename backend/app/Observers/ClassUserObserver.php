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