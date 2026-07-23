<?php

namespace App\Services;

use App\Models\Practice;
use App\Models\Question;
use App\Models\QuestionProgress;
use App\Repositories\Interfaces\PracticeRepositoryInterface;
use App\Repositories\QuestionRepository;
use App\Strategies\ScoringFactory;
use Illuminate\Database\Eloquent\Collection;

class PracticeService
{
    public function __construct(
        private readonly QuestionRepository $questionRepository,
        private readonly ScoringFactory $scoringFactory,
        private readonly PracticeRepositoryInterface $practiceRepository
    ) {}

    // ==================== Teacher CRUD ====================

    public function getAllByUser(int $userId): Collection
    {
        return $this->practiceRepository->getAllByUser($userId)
            ->map(function ($practice) {
                $practice->attempts_count = 0;
                return $practice;
            });
    }

    public function getById(int $id): ?Practice
    {
        return $this->practiceRepository->getById($id);
    }

    public function create(int $userId, array $data): Practice
    {
        $data['created_by'] = $userId;

        $practice = $this->practiceRepository->create($data);

        app(ActivityLogService::class)->log(
            'create_practice',
            Practice::class,
            $practice->id,
            "User (ID: {$userId}) created practice \"{$practice->title}\""
        );

        return $practice;
    }

    public function update(int $id, array $data): ?Practice
    {
        $practice = $this->practiceRepository->update($id, $data);

        if ($practice) {
            app(ActivityLogService::class)->log(
                'update_practice',
                Practice::class,
                $id,
                "Updated practice \"{$practice->title}\" (ID: {$id})"
            );
        }

        return $practice;
    }

    public function delete(int $id): bool
    {
        $practice = $this->practiceRepository->getById($id);
        $title = $practice?->title ?? 'Unknown';

        $deleted = $this->practiceRepository->delete($id);

        if ($deleted) {
            app(ActivityLogService::class)->log(
                'delete_practice',
                Practice::class,
                $id,
                "Deleted practice \"{$title}\" (ID: {$id})"
            );
        }

        return $deleted;
    }

    public function getStudentPractices(int $userId): Collection
    {
        return $this->practiceRepository->getStudentPractices($userId)
            ->map(function ($practice) {
                $practice->class_name = $practice->classes->first()?->name;
                // Dùng unsetRelation thay vì gán null để tránh crash
                // getClassIdsAttribute() trong $appends khi serialize JSON
                $practice->unsetRelation('classes');
                return $practice;
            });
    }

    // ==================== Student Practice ====================

    public function getQuestion(int $questionId): Question
    {
        return $this->questionRepository->getById($questionId);
    }

    public function getRandomQuestions(int $limit = 10, ?int $subjectId = null)
    {
        return $this->questionRepository->getRandomQuestions($limit, $subjectId);
    }

    public function getPracticeQuestions(int $practiceId): Collection
    {
        return $this->questionRepository->getByPracticeId($practiceId);
    }

    public function submitAnswer(int $userId, int $questionId, mixed $answer): array
    {
        $question = $this->questionRepository->getById($questionId);
        $questionArray = $question->toArray();

        $isCorrect = $this->scoringFactory->isCorrect(
            $question->type,
            $questionArray,
            $answer
        );

        $score = $this->scoringFactory->calculateScore(
            $question->type,
            $questionArray,
            $answer
        );

        if ($question->type === 'table_fill') {
            $rawAnswers = $questionArray['data']['correct_answers'] ?? [];
            $rightColumn = [];
            foreach ($rawAnswers as $colData) {
                $vals = is_array($colData) ? array_values($colData) : [$colData];
                $rightColumn[] = $vals[0] ?? '';
            }
            $correctAnswer = $rightColumn;
        } else {
            $correctAnswer = $this->scoringFactory->getCorrectAnswer($question->type, $questionArray);
        }

        $this->updateProgress($userId, $questionId, $isCorrect, $answer);

        return [
            'is_correct'    => $isCorrect,
            'score'         => $score,
            'correct_answer'=> $correctAnswer,
            'explanation'   => $question->explanation,
            'question_type' => $question->type,
        ];
    }

    public function getProgress(int $userId): array
    {
        $progress = QuestionProgress::where('user_id', $userId)
            ->with('question:id,content,type,subject_id')
            ->orderBy('last_attempt_at', 'desc')
            ->limit(20)
            ->get();

        $stats = [
            'total_attempts' => $progress->count(),
            'correct_count'  => $progress->where('is_correct', true)->count(),
            'accuracy'       => $progress->count() > 0
                ? round($progress->where('is_correct', true)->count() / $progress->count() * 100, 1)
                : 0,
        ];

        return [
            'recent' => $progress,
            'stats'  => $stats,
        ];
    }

    private function updateProgress(int $userId, int $questionId, bool $isCorrect, mixed $answer): void
    {
        $progress = QuestionProgress::where('user_id', $userId)
            ->where('question_id', $questionId)
            ->first();

        if ($progress) {
            $progress->update([
                'is_correct'      => $isCorrect,
                'last_answer'     => $answer,
                'attempt_count'   => $progress->attempt_count + 1,
                'last_attempt_at' => now(),
            ]);
        } else {
            QuestionProgress::create([
                'user_id'         => $userId,
                'question_id'     => $questionId,
                'is_correct'      => $isCorrect,
                'last_answer'     => $answer,
                'attempt_count'   => 1,
                'last_attempt_at' => now(),
            ]);
        }
    }
}
