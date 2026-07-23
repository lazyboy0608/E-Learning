<?php

namespace App\Services;

use App\Models\ClassModel;
use App\Models\ClassUser;
use App\Models\User;
use App\Repositories\Interfaces\ClassRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClassService
{
    public function __construct(
        private readonly ClassRepositoryInterface $classRepository
    ) {}

    public function getAllClasses(array $filters = [], ?int $userId = null): \Illuminate\Database\Eloquent\Collection
    {
        return $this->classRepository->getAll($filters, $userId);
    }

    public function searchClasses(string $query): \Illuminate\Database\Eloquent\Collection
    {
        return $this->classRepository->search($query);
    }

    public function getClassDetail(int $id): ?ClassModel
    {
        return $this->classRepository->getById($id);
    }

    public function createClass(int $userId, array $data): ClassModel
    {
        $data['created_by'] = $userId;
        $data['class_code'] = $data['class_code'] ?? $this->generateClassCode();

        $class = DB::transaction(fn () => $this->classRepository->create($data));

        app(\App\Services\ActivityLogService::class)->log(
            'create',
            \App\Models\ClassModel::class,
            $class->id,
            "Created class \"{$class->name}\" (ID: {$class->id}, Code: {$class->class_code}) by user ID: {$userId}"
        );

        return $class;
    }

    public function updateClass(int $id, array $data): ClassModel
    {
        $class = $this->classRepository->getById($id);
        
        if (!$class) {
            throw new \InvalidArgumentException('Class not found.');
        }

        $updatedClass = $this->classRepository->update($id, $data);

        app(\App\Services\ActivityLogService::class)->log(
            'update',
            \App\Models\ClassModel::class,
            $id,
            "Updated class \"{$updatedClass->name}\" (ID: {$id})"
        );

        return $updatedClass;
    }

    public function deleteClass(int $id): bool
    {
        $class = $this->classRepository->getById($id);
        $name = $class ? $class->name : 'Unknown';

        $deleted = $this->classRepository->delete($id);

        if ($deleted) {
            app(\App\Services\ActivityLogService::class)->log(
                'delete',
                \App\Models\ClassModel::class,
                $id,
                "Deleted class \"{$name}\" (ID: {$id})"
            );
        }

        return $deleted;
    }

    public function joinClass(int $userId, string $code): array
    {
        $class = $this->classRepository->getByCode($code);

        if (!$class) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy lớp với mã này.',
            ];
        }

        $existingMember = ClassUser::where('class_id', $class->id)
            ->where('user_id', $userId)
            ->first();

        if ($existingMember) {
            return [
                'success' => false,
                'message' => 'Bạn đã là thành viên của lớp này.',
            ];
        }

        DB::transaction(fn () => $this->classRepository->addStudent($class->id, $userId));

        app(\App\Services\ActivityLogService::class)->log(
            'join_class',
            \App\Models\ClassModel::class,
            $class->id,
            "User (ID: {$userId}) joined class \"{$class->name}\" (ID: {$class->id})"
        );

        return [
            'success' => true,
            'message' => 'Tham gia lớp thành công.',
            'class'   => $class,
        ];
    }

    public function leaveClass(int $userId, int $classId): array
    {
        $class = $this->classRepository->getById($classId);

        if (!$class) {
            return [
                'success' => false,
                'message' => 'Lop khong ton tai.',
            ];
        }

        $removed = $this->classRepository->removeStudent($classId, $userId);

        if (!$removed) {
            return [
                'success' => false,
                'message' => 'Ban khong phai thanh vien cua lop nay.',
            ];
        }

        app(\App\Services\ActivityLogService::class)->log(
            'leave_class',
            \App\Models\ClassModel::class,
            $classId,
            "User (ID: {$userId}) left class \"{$class->name}\" (ID: {$classId})"
        );

        return [
            'success' => true,
            'message' => 'Roi khoi lop thanh cong.',
        ];
    }

    public function addStudent(int $classId, int $userId): array
    {
        $user = User::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Nguoi dung khong ton tai.',
            ];
        }

        if ($user->role !== 'student') {
            return [
                'success' => false,
                'message' => 'Chi co the them hoc sinh.',
            ];
        }

        $existing = ClassUser::where('class_id', $classId)
            ->where('user_id', $userId)
            ->where('role', 'student')
            ->first();

        if ($existing) {
            return [
                'success' => false,
                'message' => 'Hoc sinh da ton tai trong lop.',
            ];
        }

        $this->classRepository->addStudent($classId, $userId);

        app(\App\Services\ActivityLogService::class)->log(
            'add_student',
            \App\Models\ClassModel::class,
            $classId,
            "Added student \"{$user->name}\" (ID: {$userId}) to class ID: {$classId}"
        );

        return [
            'success' => true,
            'message' => 'Them hoc sinh thanh cong.',
        ];
    }

    public function removeStudent(int $classId, int $userId): array
    {
        $removed = $this->classRepository->removeStudent($classId, $userId);

        if (!$removed) {
            return [
                'success' => false,
                'message' => 'Hoc sinh khong ton tai trong lop.',
            ];
        }

        app(\App\Services\ActivityLogService::class)->log(
            'remove_student',
            \App\Models\ClassModel::class,
            $classId,
            "Removed student ID: {$userId} from class ID: {$classId}"
        );

        return [
            'success' => true,
            'message' => 'Xoa hoc sinh thanh cong.',
        ];
    }

    public function addTeacher(int $classId, int $userId): array
    {
        $user = User::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Nguoi dung khong ton tai.',
            ];
        }

        if ($user->role !== 'teacher' && $user->role !== 'admin') {
            return [
                'success' => false,
                'message' => 'Chi co the them giao vien.',
            ];
        }

        $existing = ClassUser::where('class_id', $classId)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            return [
                'success' => false,
                'message' => 'Giao vien da ton tai trong lop.',
            ];
        }

        $this->classRepository->addTeacher($classId, $userId);

        return [
            'success' => true,
            'message' => 'Them giao vien thanh cong.',
        ];
    }

    public function removeTeacher(int $classId, int $userId): array
    {
        $removed = $this->classRepository->removeTeacher($classId, $userId);

        if (!$removed) {
            return [
                'success' => false,
                'message' => 'Giao vien khong ton tai trong lop.',
            ];
        }

        return [
            'success' => true,
            'message' => 'Xoa giao vien thanh cong.',
        ];
    }

    public function getStudents(int $classId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->classRepository->getStudents($classId);
    }

    public function getTeachers(int $classId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->classRepository->getTeachers($classId);
    }

    public function addMaterial(int $classId, array $data): \App\Models\ClassMaterial
    {
        $material = $this->classRepository->addMaterial($classId, $data);

        app(\App\Services\ActivityLogService::class)->log(
            'add_material',
            \App\Models\ClassModel::class,
            $classId,
            "Added material \"{$material->title}\" (ID: {$material->id}) to class ID: {$classId}"
        );

        return $material;
    }

    public function removeMaterial(int $classId, int $materialId): bool
    {
        $material = \App\Models\ClassMaterial::find($materialId);
        $title = $material ? $material->title : 'Unknown';

        $removed = $this->classRepository->removeMaterial($classId, $materialId);

        if ($removed) {
            app(\App\Services\ActivityLogService::class)->log(
                'remove_material',
                \App\Models\ClassModel::class,
                $classId,
                "Removed material \"{$title}\" (ID: {$materialId}) from class ID: {$classId}"
            );
        }

        return $removed;
    }

    public function getMaterials(int $classId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->classRepository->getMaterials($classId);
    }

    public function assignTest(int $classId, int $testId): array
    {
        $existing = \App\Models\ClassTest::where('class_id', $classId)
            ->where('test_id', $testId)
            ->first();

        if ($existing) {
            return [
                'success' => false,
                'message' => 'Bai kiem tra da duoc gan cho lop nay.',
            ];
        }

        $this->classRepository->assignTest($classId, $testId);

        return [
            'success' => true,
            'message' => 'Gan bai kiem tra thanh cong.',
        ];
    }

    public function removeTest(int $classId, int $testId): bool
    {
        return $this->classRepository->removeTest($classId, $testId);
    }

    public function getTests(int $classId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->classRepository->getTests($classId);
    }

    public function assignPractice(int $classId, int $practiceId): array
    {
        $existing = \App\Models\ClassPractice::where('class_id', $classId)
            ->where('practice_id', $practiceId)->first();

        if ($existing) {
            return [
                'success' => false,
                'message' => 'Bai on tap da duoc gan cho lop nay.',
            ];
        }

        $this->classRepository->assignPractice($classId, $practiceId);

        return [
            'success' => true,
            'message' => 'Gan bai on tap thanh cong.',
        ];
    }

    public function removePractice(int $classId, int $practiceId): bool
    {
        return $this->classRepository->removePractice($classId, $practiceId);
    }

    public function getPractices(int $classId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->classRepository->getPractices($classId);
    }

    public function canAccessClass(int $userId, int $classId): bool
    {
        $class = $this->classRepository->getById($classId);

        if (!$class) {
            return false;
        }

        if ($class->created_by === $userId) {
            return true;
        }

        $member = ClassUser::where('class_id', $classId)
            ->where('user_id', $userId)
            ->first();

        return $member !== null;
    }

    public function canManageClass(int $userId, int $classId): bool
    {
        $class = $this->classRepository->getById($classId);

        if (!$class) {
            return false;
        }

        if ($class->created_by === $userId) {
            return true;
        }

        $member = ClassUser::where('class_id', $classId)
            ->where('user_id', $userId)
            ->where('role', 'teacher')
            ->first();

        return $member !== null;
    }

    private function generateClassCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (ClassModel::where('class_code', $code)->exists());

        return $code;
    }
}
