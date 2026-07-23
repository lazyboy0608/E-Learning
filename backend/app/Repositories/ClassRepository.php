<?php

namespace App\Repositories;

use App\Models\ClassModel;
use App\Models\ClassMaterial;
use App\Models\ClassUser;
use App\Models\ClassTest;
use App\Models\User;
use App\Models\Test;
use App\Models\Practice;
use App\Repositories\Interfaces\ClassRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ClassRepository implements ClassRepositoryInterface
{
    public function getAll(array $filters = [], ?int $userId = null): Collection
    {
        $query = ClassModel::with(['creator', 'users', 'teachers']);

        if ($userId) {
            $query->whereHas('users', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            })
            ->orWhere('created_by', $userId);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function search(string $query): Collection
    {
        $normalized = trim($query);

        return ClassModel::with(['creator'])
            ->where(function ($q) use ($normalized) {
                $q->where('class_code', 'like', "%{$normalized}%")
                  ->orWhere('name', 'like', "%{$normalized}%");
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getById(int $id): ?ClassModel
    {
        return ClassModel::with([
            'creator',
            'users',
            'materials',
            'practices' => function ($q) {
                $q->withCount('questions');
            },
            'tests' => function ($q) {
                $q->withCount('questions');
            },
        ])->find($id);
    }

    public function getByCode(string $code): ?ClassModel
    {
        return ClassModel::where('class_code', $code)
            ->orWhere('name', 'like', "%{$code}%")
            ->first();
    }

    public function create(array $data): ClassModel
    {
        return ClassModel::create($data);
    }

    public function update(int $id, array $data): ClassModel
    {
        $class = ClassModel::findOrFail($id);
        $class->update($data);
        return $class->fresh();
    }

    public function delete(int $id): bool
    {
        $class = ClassModel::findOrFail($id);
        return $class->delete();
    }

    public function getStudents(int $classId): Collection
    {
        return User::whereHas('classUsers', function ($q) use ($classId) {
            $q->where('class_id', $classId)
              ->where('role', 'student');
        })->get();
    }

    public function getTeachers(int $classId): Collection
    {
        return User::whereHas('classUsers', function ($q) use ($classId) {
            $q->where('class_id', $classId)
              ->where('role', 'teacher');
        })
        ->orWhereHas('createdClasses', function ($q) use ($classId) {
            $q->where('id', $classId);
        })
        ->get();
    }

    public function getMaterials(int $classId): Collection
    {
        return ClassMaterial::where('class_id', $classId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getTests(int $classId): Collection
    {
        return Test::whereHas('classTests', function ($q) use ($classId) {
            $q->where('class_id', $classId);
        })->get();
    }

    public function getPractices(int $classId): Collection
    {
        return Practice::whereHas('classPractices', function ($q) use ($classId) {
            $q->where('class_id', $classId);
        })->get();
    }

    public function assignPractice(int $classId, int $practiceId): ClassPractice
    {
        return ClassPractice::firstOrCreate([
            'class_id' => $classId,
            'practice_id' => $practiceId,
        ]);
    }

    public function removePractice(int $classId, int $practiceId): bool
    {
        return ClassPractice::where('class_id', $classId)
            ->where('practice_id', $practiceId)
            ->delete();
    }

    public function addStudent(int $classId, int $userId): ClassUser
    {
        return ClassUser::firstOrCreate([
            'class_id' => $classId,
            'user_id' => $userId,
            'role' => 'student',
        ]);
    }

    public function removeStudent(int $classId, int $userId): bool
    {
        return ClassUser::where('class_id', $classId)
            ->where('user_id', $userId)
            ->where('role', 'student')
            ->delete();
    }

    public function addTeacher(int $classId, int $userId): ClassUser
    {
        return ClassUser::firstOrCreate([
            'class_id' => $classId,
            'user_id' => $userId,
            'role' => 'teacher',
        ]);
    }

    public function removeTeacher(int $classId, int $userId): bool
    {
        return ClassUser::where('class_id', $classId)
            ->where('user_id', $userId)
            ->where('role', 'teacher')
            ->delete();
    }

    public function addMaterial(int $classId, array $data): ClassMaterial
    {
        $data['class_id'] = $classId;
        return ClassMaterial::create($data);
    }

    public function removeMaterial(int $classId, int $materialId): bool
    {
        return ClassMaterial::where('class_id', $classId)
            ->where('id', $materialId)
            ->delete();
    }

    public function assignTest(int $classId, int $testId): ClassTest
    {
        return ClassTest::firstOrCreate([
            'class_id' => $classId,
            'test_id' => $testId,
        ]);
    }

    public function removeTest(int $classId, int $testId): bool
    {
        return ClassTest::where('class_id', $classId)
            ->where('test_id', $testId)
            ->delete();
    }
}
