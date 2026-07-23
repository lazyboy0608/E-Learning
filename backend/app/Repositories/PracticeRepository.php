<?php

namespace App\Repositories;

use App\Models\ClassModel;
use App\Models\ClassPractice;
use App\Models\Practice;
use App\Models\PracticeQuestion;
use App\Repositories\Interfaces\PracticeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PracticeRepository implements PracticeRepositoryInterface
{
    public function getAllByUser(int $userId): Collection
    {
        return Practice::where('created_by', $userId)
            ->with('subject:id,name')
            ->withCount('questions')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getById(int $id): ?Practice
    {
        return Practice::with('subject:id,name')
            ->withCount('questions')
            ->find($id);
    }

    public function create(array $data): Practice
    {
        return DB::transaction(function () use ($data) {
            $practice = Practice::create([
                'title'       => $data['title'],
                'subject_id'  => $data['subject_id'],
                'created_by'  => $data['created_by'],
                'description' => $data['description'] ?? null,
                'is_active'   => true,
            ]);

            if (!empty($data['question_ids'])) {
                foreach ($data['question_ids'] as $index => $questionId) {
                    PracticeQuestion::create([
                        'practice_id' => $practice->id,
                        'question_id' => $questionId,
                        'order_index' => $index,
                    ]);
                }
            }

            if (!empty($data['class_ids'])) {
                foreach ($data['class_ids'] as $classId) {
                    ClassPractice::create([
                        'class_id'    => $classId,
                        'practice_id' => $practice->id,
                    ]);
                }
            }

            $practice->load('subject:id,name');
            $practice->loadCount('questions');

            return $practice;
        });
    }

    public function update(int $id, array $data): ?Practice
    {
        $practice = Practice::find($id);

        if (!$practice) {
            return null;
        }

        return DB::transaction(function () use ($practice, $data) {
            $updateData = array_filter([
                'title'       => $data['title'] ?? null,
                'subject_id'  => $data['subject_id'] ?? null,
                'description' => $data['description'] ?? null,
            ], fn($v) => $v !== null);

            if (!empty($updateData)) {
                $practice->update($updateData);
            }

            if (isset($data['question_ids'])) {
                $practice->questions()->delete();
                foreach ($data['question_ids'] as $index => $questionId) {
                    PracticeQuestion::create([
                        'practice_id' => $practice->id,
                        'question_id' => $questionId,
                        'order_index' => $index,
                    ]);
                }
            }

            if (isset($data['class_ids'])) {
                $practice->classes()->sync($data['class_ids']);
            }

            $practice->load('subject:id,name');
            $practice->loadCount('questions');

            return $practice->fresh(['subject', 'classes']);
        });
    }

    public function delete(int $id): bool
    {
        $practice = Practice::find($id);

        if (!$practice) {
            return false;
        }

        return (bool) $practice->delete();
    }

    public function getStudentPractices(int $userId): Collection
    {
        $classIds = ClassModel::whereHas('students', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->pluck('id');

        return Practice::whereHas('classes', function ($q) use ($classIds) {
            $q->whereIn('classes.id', $classIds);
        })
            ->with(['subject:id,name', 'classes:id,name', 'creator:id,name'])
            ->withCount('questions')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
