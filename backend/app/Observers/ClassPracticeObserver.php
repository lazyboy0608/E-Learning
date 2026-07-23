<?php

namespace App\Observers;

use App\Models\ClassPractice;
use App\Notifications\AssignmentCreatedByTeacherNotification;
use App\Notifications\NewAssignmentForStudentNotification;
use App\Events\NotificationCreated;

class ClassPracticeObserver
{
    public function created(ClassPractice $classPractice): void
    {
        $classPractice->load(['class.students', 'practice.creator']);

        $class = $classPractice->class;
        $practice = $classPractice->practice;
        $teacher = $practice->creator;
        $students = $class->students;

        $assignmentName = $practice->title;
        $className = $class->name;
        $type = 'practice';

        // Notification cho giáo viên
        if ($teacher) {
            $teacher->notify(
                new AssignmentCreatedByTeacherNotification(
                    $assignmentName,
                    $className,
                    $type
                )
            );
            event(new NotificationCreated($teacher->id));
        }

        // Notification cho từng học sinh
        foreach ($students as $student) {
            $student->notify(
                new NewAssignmentForStudentNotification(
                    $assignmentName,
                    $teacher->name ?? 'Giáo viên',
                    $type
                )
            );
            event(new NotificationCreated($student->id));
        }
    }
}
