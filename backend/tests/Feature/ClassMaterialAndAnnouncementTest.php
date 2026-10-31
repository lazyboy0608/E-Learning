<?php

namespace Tests\Feature;

use App\Models\ClassAnnouncement;
use App\Models\ClassMaterial;
use App\Models\ClassModel;
use App\Models\ClassUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClassMaterialAndAnnouncementTest extends TestCase
{
    use RefreshDatabase;

    public function test_material_creation_triggers_announcement_and_event()
    {
        Event::fake([\App\Events\ClassFeedUpdated::class]);

        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);

        $class = ClassModel::create([
            'name' => 'Lớp Toán 1A Test',
            'created_by' => $teacher->id,
            'class_code' => 'TEST1A',
        ]);

        ClassUser::create([
            'class_id' => $class->id,
            'user_id' => $student->id,
            'role' => 'student',
        ]);

        // Tạo tài liệu mới
        $material = ClassMaterial::create([
            'class_id' => $class->id,
            'title' => 'Tài liệu ôn tập Hình học',
            'file_url' => 'https://example.com/test.pdf',
            'type' => 'pdf',
            'file_size' => 1024 * 1024 * 2,
            'original_name' => 'Hinh_hoc_1A.pdf',
        ]);

        // Kiểm tra ClassAnnouncement đã được tự động tạo
        $this->assertDatabaseHas('class_announcements', [
            'class_id' => $class->id,
            'type' => 'material',
            'title' => 'Tài liệu học tập mới',
        ]);

        Event::assertDispatched(\App\Events\ClassFeedUpdated::class, function ($event) use ($class) {
            return $event->classId === $class->id && $event->announcement->type === 'material';
        });

        // Kiểm tra accessor formatted_size
        $this->assertEquals('2 MB', $material->formatted_size);
    }

    public function test_student_joining_class_triggers_welcome_announcement()
    {
        Event::fake([\App\Events\ClassFeedUpdated::class]);

        $teacher = User::factory()->create(['role' => 'teacher']);
        $newStudent = User::factory()->create(['name' => 'Hoàng Văn C', 'role' => 'student']);

        $class = ClassModel::create([
            'name' => 'Lớp Tiếng Việt 1B Test',
            'created_by' => $teacher->id,
            'class_code' => 'TEST1B',
        ]);

        ClassUser::create([
            'class_id' => $class->id,
            'user_id' => $newStudent->id,
            'role' => 'student',
        ]);

        $this->assertDatabaseHas('class_announcements', [
            'class_id' => $class->id,
            'type' => 'student_joined',
            'title' => 'Thành viên mới',
            'content' => 'Chào mừng bạn Hoàng Văn C gia nhập lớp học!',
        ]);

        Event::assertDispatched(\App\Events\ClassFeedUpdated::class);
    }

    public function test_assign_test_triggers_announcement()
    {
        Event::fake([\App\Events\ClassFeedUpdated::class]);

        $teacher = User::factory()->create(['role' => 'teacher']);
        $subject = \App\Models\Subject::create(['name' => 'Toán Học', 'class_level' => 'Lớp 1']);
        $class = ClassModel::create([
            'name' => 'Lớp Test Exam',
            'created_by' => $teacher->id,
            'class_code' => 'TESTEXAM',
        ]);

        $test = \App\Models\Test::create([
            'title' => 'Kiểm tra 15 phút Toán',
            'subject_id' => $subject->id,
            'created_by' => $teacher->id,
            'test_code' => 'MATH15',
            'access_type' => 'class_only',
            'is_active' => true,
        ]);

        \App\Models\ClassTest::create([
            'class_id' => $class->id,
            'test_id' => $test->id,
        ]);

        $this->assertDatabaseHas('class_announcements', [
            'class_id' => $class->id,
            'type' => 'test',
            'title' => 'Bài kiểm tra mới',
        ]);

        Event::assertDispatched(\App\Events\ClassFeedUpdated::class);
    }

    public function test_assign_practice_triggers_announcement()
    {
        Event::fake([\App\Events\ClassFeedUpdated::class]);

        $teacher = User::factory()->create(['role' => 'teacher']);
        $subject = \App\Models\Subject::create(['name' => 'Tiếng Việt', 'class_level' => 'Lớp 1']);
        $class = ClassModel::create([
            'name' => 'Lớp Test Practice',
            'created_by' => $teacher->id,
            'class_code' => 'TESTPRAC',
        ]);

        $practice = \App\Models\Practice::create([
            'title' => 'Ôn tập phép cộng trong phạm vi 10',
            'subject_id' => $subject->id,
            'created_by' => $teacher->id,
            'is_active' => true,
        ]);

        \App\Models\ClassPractice::create([
            'class_id' => $class->id,
            'practice_id' => $practice->id,
        ]);

        $this->assertDatabaseHas('class_announcements', [
            'class_id' => $class->id,
            'type' => 'practice',
            'title' => 'Bài ôn tập mới',
        ]);

        Event::assertDispatched(\App\Events\ClassFeedUpdated::class);
    }

    public function test_upload_material_saves_file_and_metadata()
    {
        Storage::fake('s3');
        Storage::fake('public');

        $teacher = User::factory()->create(['role' => 'teacher']);
        $class = ClassModel::create([
            'name' => 'Lớp Test Upload',
            'created_by' => $teacher->id,
            'class_code' => 'UPLOAD1',
        ]);

        $file = UploadedFile::fake()->create('bai_giang_hinh_hoc.pdf', 500, 'application/pdf');

        $service = app(\App\Services\ClassService::class);
        $material = $service->addMaterial($class->id, [
            'title' => 'Bài giảng Hình học cơ bản',
            'type' => 'pdf',
            'description' => 'Tài liệu tuần 1',
        ], $file);

        $this->assertNotNull($material->file_url);
        $this->assertEquals('bai_giang_hinh_hoc.pdf', $material->original_name);
        $this->assertGreaterThan(0, $material->file_size);
        $this->assertEquals('pdf', $material->type);

        $this->assertDatabaseHas('class_materials', [
            'id' => $material->id,
            'class_id' => $class->id,
            'title' => 'Bài giảng Hình học cơ bản',
            'original_name' => 'bai_giang_hinh_hoc.pdf',
        ]);
    }
}
