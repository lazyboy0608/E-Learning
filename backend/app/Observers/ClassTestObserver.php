<?php

namespace App\Observers;

use App\Models\ClassTest;
use App\Notifications\AssignmentCreatedByTeacherNotification;
use App\Notifications\NewAssignmentForStudentNotification;
use App\Events\NotificationCreated;

class ClassTestObserver
{
    public function created(ClassTest $classTest): void
    {
        $classTest->load(['class.students', 'test.creator']);

        $class = $classTest->class;
        $test = $classTest->test;
        $teacher = $test->creator;
        $students = $class->students;

        $assignmentName = $test->title;
        $className = $class->name;
        $type = 'test';

        // Bảng tin lớp học (Class Announcement Feed)
        $teacherName = $teacher->name ?? 'Giáo viên';
        $announcement = \App\Models\ClassAnnouncement::create([
            'class_id' => $class->id,
            'author_id' => $teacher ? $teacher->id : null,
            'type' => 'test',
            'title' => 'Bài kiểm tra mới',
            'content' => "Thầy/Cô {$teacherName} vừa giao bài kiểm tra mới cho lớp: {$test->title}",
            'data' => [
                'test_id' => $test->id,
                'title' => $test->title,
                'duration' => $test->duration,
            ],
        ]);

        event(new \App\Events\ClassFeedUpdated($class->id, $announcement));

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
