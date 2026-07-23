<?php

namespace App\Services;

use App\Models\Question;
use App\Repositories\QuestionRepository;
use App\Strategies\Scoring\ScoringStrategyFactory;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\User;
use App\Builders\Question\QuestionBuilderFactory;

class QuestionService
{
    public function __construct(
        private readonly QuestionRepository $questionRepository,
        private readonly ScoringStrategyFactory $scoringFactory,
        private readonly QuestionBuilderFactory $builderFactory,
    ) {}

    public function getAllQuestions(array $filters = []): LengthAwarePaginator
    {
        return $this->questionRepository->getAll($filters);
    }

    public function getQuestion(int $id): Question
    {
        return $this->questionRepository->getById($id);
    }

    public function createQuestion(array $data, int $creatorId): Question
    {
        $user = User::findOrFail(
            $creatorId
        );

        $data['created_by'] = $creatorId;

        $data['scope'] =
            $user->role === 'admin'
                ? 'system'
                : 'class';

        $builder = $this->builderFactory ->make($data['type']);

        $questionData = $builder->build($data);

        $question = $this->questionRepository ->create($questionData);

        app(\App\Services\ActivityLogService::class)->log(
            'create',
            \App\Models\Question::class,
            $question->id,
            "Created question (ID: {$question->id}, Type: {$question->type})"
        );

        return $question;
    }

    public function updateQuestion(int $id, array $data): Question
    {
        $question = $this->getQuestion($id);

        $mergedData = [
            'subject_id' => $data['subject_id']
                ?? $question->subject_id,

            'type' => $data['type']
                ?? $question->type,

            'content' => $data['content']
                ?? $question->content,

            'media_image' => $data['media_image']
                ?? $question->media_image,

            'media_audio' => $data['media_audio']
                ?? $question->media_audio,

            'explanation' => $data['explanation']
                ?? $question->explanation,

            'scope' => $question->scope,

            'created_by' => $question->created_by,

            'data' => $data['data']
                ?? $question->data,
        ];

        $builder = $this->builderFactory ->make($mergedData['type']);

        $questionData = $builder->build($mergedData);

        $question = $this->questionRepository->update(
            $id,
            $questionData
        );

        app(\App\Services\ActivityLogService::class)->log(
            'update',
            \App\Models\Question::class,
            $id,
            "Updated question (ID: {$id})"
        );

        return $question;
    }

    public function deleteQuestion(int $id): bool
    {
        $deleted = $this->questionRepository->delete($id);

        if ($deleted) {
            app(\App\Services\ActivityLogService::class)->log(
                'delete',
                \App\Models\Question::class,
                $id,
                "Deleted question (ID: {$id})"
            );
        }

        return $deleted;
    }

    public function getQuestionsBySubject(int $subjectId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->questionRepository->getBySubject($subjectId);
    }

    public function getQuestionsByCreator(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->questionRepository->getByCreator($userId);
    }

    public function checkAnswer(int $questionId, mixed $answer): array
    {
        $question = $this->getQuestion($questionId);
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

        return [
            'is_correct' => $isCorrect,
            'score' => $score,
            'correct_answer' => $this->scoringFactory->getCorrectAnswer($question->type, $questionArray),
        ];
    }

    public function calculateScore(string $type, array $questionData, mixed $answer): float
    {
        return $this->scoringFactory->calculateScore($type, $questionData, $answer);
    }
}
