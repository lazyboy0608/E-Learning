<?php

namespace App\Repositories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class QuestionRepository
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Question::with(['subject']);

        if (!empty($filters['scope'])) {
            $query->where('scope', $filters['scope']);
        }
        
        if (!empty($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }
        
        if (!empty($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }
        
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query
            ->orderByDesc('id')
            ->paginate(20);
    }

    public function getById(int $id): Question
    {
        return Question::findOrFail($id);
    }

    public function create(array $data): Question
    {
        return Question::create($data);
    }

    public function update(int $id, array $data): Question
    {
        $question = $this->getById($id);

        $question->update($data);

        return $question;
    }

    public function delete(int $id): bool
    {
        $question = $this->getById($id);

        return $question->delete();
    }

    public function getBySubject(int $subjectId): Collection
    {
        return Question::where('subject_id', $subjectId)->get();
    }

    public function getByCreator(int $userId): Collection
    {
        return Question::where('created_by', $userId)->get();
    }

    public function getRandomQuestions(int $limit = 10, ?int $subjectId = null): Collection
    {
        $query = Question::query();

        if ($subjectId !== null) {
            $query->where('subject_id', $subjectId);
        }

        return $query
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }

    public function getByPracticeId(int $practiceId): Collection
    {
        return Question::whereHas('practiceQuestions', function ($q) use ($practiceId) {
                $q->where('practice_id', $practiceId);
            })
            ->with('subject:id,name')
            ->get();
    }
}