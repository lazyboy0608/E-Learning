<?php

namespace App\Services;

use App\Models\TestAttempt;
use App\Models\TestAnswer;
use App\Models\User;
use App\Repositories\TestRepository;
use App\Strategies\ScoringFactory;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Models\ClassUser;

class TestService
{
    public function __construct(
        private readonly TestRepository $testRepository,
        private readonly ScoringFactory $scoringFactory
    ) {
    }

    public function getAllTests(array $filters = [], User $user): Collection
    {
        return $this->testRepository->getAll(
            $filters,
            $user
        );
    }

    public function getTestById(int $id): mixed
    {
        return $this->testRepository->getById($id);
    }

    public function getTestByCode(string $code): mixed
    {
        return $this->testRepository->getByCode($code);
    }

    public function getAvailableTests(int $userId): Collection
    {
        return $this->testRepository->getAvailableTestsForUser($userId);
    }

    public function getSystemTests(): Collection
    {
        return $this->testRepository->getSystemTests();
    }

    public function getTestWithQuestions(int $testId): mixed
    {
        return $this->testRepository->getTestWithQuestions($testId);
    }

    public function createTest(int $userId, array $data): mixed
    {
        $user = User::findOrFail($userId);

        $data['created_by'] = $userId;

        $data['scope'] =
            $user->role === 'admin'
            ? 'system'
            : 'class';

        $test = DB::transaction(fn () => $this->testRepository->createTest($data));

        app(\App\Services\ActivityLogService::class)->log(
            'create',
            \App\Models\Test::class,
            $test->id,
            "User {$user->name} (ID: {$userId}) created test \"{$test->title}\""
        );

        return $test;
    }

    public function updateTest(int $testId, array $data): mixed
    {
        $test = DB::transaction(fn () => $this->testRepository->updateTest($testId, $data));

        app(\App\Services\ActivityLogService::class)->log(
            'update',
            \App\Models\Test::class,
            $testId,
            "Updated test \"{$test->title}\" (ID: {$testId})"
        );

        return $test;
    }

    public function deleteTest(int $testId): bool
    {
        $test = \App\Models\Test::find($testId);
        $title = $test ? $test->title : 'Unknown';

        $deleted = $this->testRepository->deleteTest($testId);

        if ($deleted) {
            app(\App\Services\ActivityLogService::class)->log(
                'delete',
                \App\Models\Test::class,
                $testId,
                "Deleted test \"{$title}\" (ID: {$testId})"
            );
        }

        return $deleted;
    }

    public function canAccessTest(int $userId, int $testId): array
    {
        $test = $this->testRepository->getById($testId);
        $errors = [];

        $classIds = ClassUser::where(
            'user_id',
            $userId
        )->pluck('class_id');

        if (
            $test->access_type === 'class_only'
            &&
            !$test->classes()
                ->whereIn('classes.id', $classIds)
                ->exists()
        ) {
            return [
                'can_access'=>false,
                'error'=>'Bạn không thuộc lớp được phép làm bài.'
            ];
        }

        // Check if test is active
        if (!$test->is_active) {
            return ['can_access' => false, 'error' => 'This test is not active.'];
        }

        // Check expiration
        if ($test->expires_at && $test->expires_at->isPast()) {
            return ['can_access' => false, 'error' => 'This test has expired.'];
        }

        // Check max attempts
        $existingAttempts = $this->testRepository->getAttempts($userId, $testId);
        $completedAttempts = $existingAttempts->where('status', '!=', TestAttempt::STATUS_IN_PROGRESS)->count();

        if ($test->max_attempts && $completedAttempts >= $test->max_attempts) {
            return [
                'can_access' => false,
                'error' => "You have reached the maximum number of attempts ({$test->max_attempts})."
            ];
        }

        // Check for active attempt
        $activeAttempt = $this->testRepository->getActiveAttempt($userId, $testId);

        return [
            'can_access' => true,
            'active_attempt' => $activeAttempt,
            'attempt_count' => $completedAttempts,
        ];
    }

    public function startTest(int $userId, int $testId): array
    {
        $access = $this->canAccessTest($userId, $testId);

        if (!$access['can_access']) {
            return [
                'success' => false,
                'error' => $access['error'],
            ];
        }

        if ($access['active_attempt']) {

            $attempt = $access['active_attempt'];

            if ($attempt->isExpired()) {

                $this->expireAttempt($attempt->id);

                return [
                    'success'=>false,
                    'error'=>'Attempt expired.'
                ];
            }

            return $this->formatAttemptResponse($attempt);
        }
        return DB::transaction(function () use ($userId, $testId) {

            $test = $this->testRepository->getById($testId);

            if (!$test->is_active) {
                return [
                    'success' => false,
                    'error' => 'Test is inactive.'
                ];
            }

            if ($test->expires_at && $test->expires_at->isPast()) {
                return [
                    'success' => false,
                    'error' => 'Test expired.'
                ];
            }

            $attempts = TestAttempt::where('user_id', $userId)
                ->where('test_id', $testId)
                ->lockForUpdate()
                ->get();

            $activeAttempt = $attempts
                ->firstWhere('status', TestAttempt::STATUS_IN_PROGRESS);

            if ($activeAttempt) {

                if ($activeAttempt->isExpired()) {

                    $this->expireAttempt($activeAttempt->id);

                } else {

                    return $this->formatAttemptResponse($activeAttempt);

                }
            }

            $completedAttempts = $attempts
                ->where('status', '!=', TestAttempt::STATUS_IN_PROGRESS)
                ->count();

            if (
                $test->max_attempts &&
                $completedAttempts >= $test->max_attempts
            ) {

                return [

                    'success' => false,

                    'error' => 'Maximum attempts reached.'

                ];
            }

            $attempt = $this->testRepository
                ->createAttempt($userId, $testId);

            app(\App\Services\ActivityLogService::class)->log(
                'start_test',
                \App\Models\TestAttempt::class,
                $attempt->id,
                "Student (User ID: {$userId}) started test (Test ID: {$testId}, Attempt ID: {$attempt->id})"
            );

            return $this->formatAttemptResponse($attempt);

        });
    }

    public function submitTest(int $attemptId, array $answers): array
    {
        return DB::transaction(function () use ($attemptId, $answers) {

            $attempt = TestAttempt::with([
                'test',
                'test.questions' => fn($q) => $q->withPivot('score')
            ])->lockForUpdate()->findOrFail($attemptId);

            // Nếu đã nộp thì không xử lý nữa
            if ($attempt->status === TestAttempt::STATUS_SUBMITTED) {
                return [
                    'success' => false,
                    'error' => 'This attempt has already been submitted.'
                ];
            }

            // Nếu hết giờ
            if ($attempt->isExpired()) {
                if ($attempt->status !== TestAttempt::STATUS_EXPIRED) {
                    $this->expireAttempt($attemptId);
                }

                return [
                    'success' => false,
                    'error' => 'This attempt has expired.'
                ];
            }

            $totalScore = 0;
            $maxScore = 0;
            $results = [];

            foreach ($attempt->test->questions as $question) {

                $questionId = $question->id;
                $questionMaxScore = $question->pivot->score ?? 1;
                $maxScore += $questionMaxScore;

                $snapshot = [
                    'id' => $question->id,
                    'scope' => $question->scope,
                    'type' => $question->type,
                    'content' => $question->content,
                    'data' => $question->data,
                    'media_image' => $question->media_image,
                    'media_audio' => $question->media_audio,
                    'explanation' => $question->explanation,
                    'max_score' => $questionMaxScore,
                ];

                if (!array_key_exists($questionId, $answers)) {
                    $this->testRepository->createAnswer(
                        $attemptId,
                        $questionId,
                        null,
                        false,
                        0,
                        $snapshot
                    );

                    $results[] = [
                        'question_id' => $questionId,
                        'is_correct' => false,
                        'score' => 0,
                        'max_score' => $questionMaxScore,
                    ];
                    continue;
                }

                $answer = $answers[$questionId];
                $questionData = $question->toArray();

                $isCorrect = $this->scoringFactory->isCorrect(
                    $question->type,
                    $questionData,
                    $answer
                );

                $score = $this->scoringFactory->calculateScore(
                    $question->type,
                    $questionData,
                    $answer
                );

                $this->testRepository->createAnswer(
                    $attemptId,
                    $questionId,
                    $answer,
                    $isCorrect,
                    $score,
                    $snapshot
                );

                $totalScore += $score * $questionMaxScore;

                $results[] = [
                    'question_id' => $questionId,
                    'is_correct' => $isCorrect,
                    'score' => $score,
                    'max_score' => $questionMaxScore,
                ];
            }

            $percentageScore =
                $maxScore > 0
                    ? ($totalScore / $maxScore) * 100
                    : 0;

            $this->testRepository->updateAttempt(
                $attemptId,
                [
                    'status' => TestAttempt::STATUS_SUBMITTED,
                    'submitted_at' => now(),
                    'score' => $percentageScore,
                    'earned_points' => $totalScore,
                    'total_points' => $maxScore,
                ]
            );

            app(\App\Services\ActivityLogService::class)->log(
                'submit_test',
                \App\Models\TestAttempt::class,
                $attemptId,
                "Student submitted test (Attempt ID: {$attemptId}) with score: " . round($percentageScore, 2) . "%"
            );

            return [
                'success' => true,
                'attempt_id' => $attemptId,
                'score' => round($percentageScore, 2),
                'earned_points' => $totalScore,
                'total_points' => $maxScore,
                'total_correct' => collect($results)
                    ->where('is_correct', true)
                    ->count(),
                'total_questions' => count($results),
                'results' => $results,
            ];
        });
    }

    public function getAllAttemptsForTest(int $testId): Collection
    {
        $attempts = $this->testRepository->getAttemptsByTestId($testId);
        try {
            $test = $this->testRepository->getTestWithQuestions($testId);
            $totalMaxScore = (float) $test->questions->sum(fn($q) => (float)($q->pivot->score ?? 1));

            foreach ($attempts as $attempt) {
                $totalMax = $attempt->total_points !== null ? (float)$attempt->total_points : $totalMaxScore;
                $earned = $attempt->earned_points !== null ? (float)$attempt->earned_points : ($totalMax > 0 ? round(((float)($attempt->score ?? 0) / 100) * $totalMax, 2) : 0);
                $attempt->setAttribute('total_points', $totalMax);
                $attempt->setAttribute('earned_points', $earned);
            }
        } catch (\Exception $e) {
            // Fallback nếu không tải được questions
        }

        return $attempts;
    }

    public function getResults(int $attemptId): array
    {
        $attempt = TestAttempt::with([
            'test.subject',
            'test.testQuestions.question',
            'answers.question',
        ])->findOrFail($attemptId);

        $testQuestionMap = $attempt->test->testQuestions
            ->keyBy('question_id');

        $earnedPoints = $attempt->earned_points !== null
            ? (float) $attempt->earned_points
            : $attempt->answers
                ->sum(function ($a) use ($testQuestionMap) {
                    $scoreRatio = $a->score ?? ($a->is_correct ? 1.0 : 0.0);
                    $maxScore = $a->question_snapshot['max_score'] ?? ($testQuestionMap->get($a->question_id)?->score ?? 1);
                    return $scoreRatio * $maxScore;
                });

        $totalPoints = $attempt->total_points !== null
            ? (float) $attempt->total_points
            : $attempt->answers
                ->sum(function ($a) use ($testQuestionMap) {
                    return $a->question_snapshot['max_score'] ?? ($testQuestionMap->get($a->question_id)?->score ?? 1);
                });

        return [
            'attempt_id' => $attempt->id,
            'test_id' => $attempt->test_id,
            'test_title' => $attempt->test->title,
            'subject' => $attempt->test->subject->name ?? null,
            'status' => $attempt->status,
            'score' => $attempt->score,
            'earned_points' => round($earnedPoints, 2),
            'total_points' => round($totalPoints, 2),
            'started_at' => $attempt->started_at,
            'submitted_at' => $attempt->submitted_at,
            'attempt_no' => $attempt->attempt_no,
            'total_questions' => $attempt->answers->count() > 0 ? $attempt->answers->count() : $attempt->test->testQuestions->count(),
            'correct_count' => $attempt->answers->where('is_correct', true)->count(),
        ];
    }

    public function getReview(int $attemptId): array
    {
        $attempt = TestAttempt::with([
            'test.subject',
            'test.questions',
            'test.testQuestions.question',
            'answers.question'
        ])->findOrFail($attemptId);

        if (!in_array($attempt->status, [TestAttempt::STATUS_SUBMITTED, TestAttempt::STATUS_EXPIRED])) {
            return ['success' => false, 'error' => 'Cannot review this attempt yet.'];
        }

        $questions = [];
        $processedQuestionIds = [];

        foreach ($attempt->test->questions as $question) {
            $processedQuestionIds[] = $question->id;
            $answer = $attempt->answers->firstWhere('question_id', $question->id);
            $snapshot = $answer?->question_snapshot;

            $content = $snapshot['content'] ?? $question->content;
            $type = $snapshot['type'] ?? $question->type;
            $questionData = !empty($snapshot['data']) ? $snapshot['data'] : $question->data;
            if (is_string($questionData)) {
                $questionData = json_decode($questionData, true) ?? [];
            }
            $fullQuestionArray = is_array($questionData) ? ['data' => $questionData, 'type' => $type] : $question->toArray();

            $maxScore = $snapshot['max_score'] ?? ($question->pivot->score ?? 1);
            $answerScore = $answer ? ($answer->score ?? ($answer->is_correct ? 1.0 : 0.0)) : 0.0;
            $earnedPoints = $answerScore * $maxScore;

            if ($type === 'table_fill') {
                $rawAnswers = $questionData['correct_answers'] ?? ($fullQuestionArray['data']['correct_answers'] ?? []);
                $rightColumn = [];
                foreach ($rawAnswers as $colData) {
                    $vals = is_array($colData) ? array_values($colData) : [$colData];
                    $rightColumn[] = $vals[0] ?? '';
                }
                $correctAnswer = $rightColumn;
            } else {
                $correctAnswer = $this->scoringFactory->getCorrectAnswer($type, $fullQuestionArray);
            }
            $correctAnswerDisplay = is_array($correctAnswer)
                ? implode(', ', $correctAnswer)
                : (string) ($correctAnswer ?? '');

            $questions[] = [
                'id' => $question->id,
                'type' => $type,
                'content' => $content,
                'data' => $questionData,
                'media_image' => $snapshot['media_image'] ?? $question->media_image,
                'media_audio' => $snapshot['media_audio'] ?? $question->media_audio,
                'explanation' => $snapshot['explanation'] ?? $question->explanation,
                'user_answer' => $answer?->answer,
                'is_correct' => $answer?->is_correct,
                'correct_answer' => $correctAnswer,
                'correct_answer_display' => $correctAnswerDisplay,
                'max_score' => $maxScore,
                'earned_points' => $earnedPoints,
            ];
        }

        // Include any answers for questions removed from test questions
        foreach ($attempt->answers as $answer) {
            if (in_array($answer->question_id, $processedQuestionIds)) {
                continue;
            }
            $snapshot = $answer->question_snapshot;
            $question = $answer->question;
            if (!$snapshot && !$question) {
                continue;
            }

            $content = $snapshot['content'] ?? $question?->content ?? 'Câu hỏi';
            $type = $snapshot['type'] ?? $question?->type ?? 'multiple_choice';
            $questionData = !empty($snapshot['data']) ? $snapshot['data'] : ($question?->data ?? []);
            if (is_string($questionData)) {
                $questionData = json_decode($questionData, true) ?? [];
            }
            $fullQuestionArray = is_array($questionData) ? ['data' => $questionData, 'type' => $type] : ($question ? $question->toArray() : ['data' => $questionData, 'type' => $type]);

            $maxScore = $snapshot['max_score'] ?? 1;
            $answerScore = $answer->score ?? ($answer->is_correct ? 1.0 : 0.0);
            $earnedPoints = $answerScore * $maxScore;

            if ($type === 'table_fill') {
                $rawAnswers = $questionData['correct_answers'] ?? [];
                $rightColumn = [];
                foreach ($rawAnswers as $colData) {
                    $vals = is_array($colData) ? array_values($colData) : [$colData];
                    $rightColumn[] = $vals[0] ?? '';
                }
                $correctAnswer = $rightColumn;
            } else {
                $correctAnswer = $this->scoringFactory->getCorrectAnswer($type, $fullQuestionArray);
            }
            $correctAnswerDisplay = is_array($correctAnswer)
                ? implode(', ', $correctAnswer)
                : (string) ($correctAnswer ?? '');

            $questions[] = [
                'id' => $answer->question_id,
                'type' => $type,
                'content' => $content,
                'data' => $questionData,
                'media_image' => $snapshot['media_image'] ?? $question?->media_image,
                'media_audio' => $snapshot['media_audio'] ?? $question?->media_audio,
                'explanation' => $snapshot['explanation'] ?? $question?->explanation,
                'user_answer' => $answer->answer,
                'is_correct' => $answer->is_correct,
                'correct_answer' => $correctAnswer,
                'correct_answer_display' => $correctAnswerDisplay,
                'max_score' => $maxScore,
                'earned_points' => $earnedPoints,
            ];
        }

        $totalPoints = $attempt->total_points !== null
            ? (float) $attempt->total_points
            : collect($questions)->sum('max_score');

        $earnedPoints = $attempt->earned_points !== null
            ? (float) $attempt->earned_points
            : collect($questions)->sum('earned_points');

        return [
            'attempt_id' => $attempt->id,
            'test_id' => $attempt->test_id,
            'test_title' => $attempt->test->title,
            'subject' => $attempt->test->subject->name ?? null,
            'score' => $attempt->score,
            'total_points' => round($totalPoints, 2),
            'earned_points' => round($earnedPoints, 2),
            'started_at' => $attempt->started_at,
            'submitted_at' => $attempt->submitted_at,
            'questions' => $questions,
        ];
    }

    public function getMyAttempts(int $userId): array
    {
        $attempts = $this->testRepository->getAttempts($userId);

        return $attempts->map(function ($attempt) {
            return [
                'attempt_id' => $attempt->id,
                'test_id' => $attempt->test_id,
                'test_title' => $attempt->test->title ?? 'Unknown',
                'subject' => $attempt->test->subject->name ?? null,
                'status' => $attempt->status,
                'score' => $attempt->score,
                'started_at' => $attempt->started_at,
                'submitted_at' => $attempt->submitted_at,
                'attempt_no' => $attempt->attempt_no,
                'correct_count' => $attempt->answers->where('is_correct', true)->count(),
                'total_questions' => $attempt->status === TestAttempt::STATUS_EXPIRED
                    ? $attempt->test->questions->count()
                    : $attempt->answers->count(),
            ];
        })->toArray();
    }

    public function expireAttempt(int $attemptId): void
    {
        $attempt = TestAttempt::with([
            'test.questions' => fn($q) => $q->withPivot('score'),
            'answers',
        ])->findOrFail($attemptId);

        $totalScore = 0;
        $maxScore = 0;

        foreach ($attempt->test->questions as $question) {
            $questionMaxScore = $question->pivot->score ?? 1;
            $maxScore += $questionMaxScore;

            $snapshot = [
                'id' => $question->id,
                'scope' => $question->scope,
                'type' => $question->type,
                'content' => $question->content,
                'data' => $question->data,
                'media_image' => $question->media_image,
                'media_audio' => $question->media_audio,
                'explanation' => $question->explanation,
                'max_score' => $questionMaxScore,
            ];

            $existingAnswer = $attempt->answers->firstWhere('question_id', $question->id);

            if ($existingAnswer) {
                $isCorrect = $this->scoringFactory->isCorrect(
                    $question->type,
                    $question->toArray(),
                    $existingAnswer->answer
                );
                $score = $this->scoringFactory->calculateScore(
                    $question->type,
                    $question->toArray(),
                    $existingAnswer->answer
                );
                $existingAnswer->is_correct = $isCorrect;
                $existingAnswer->score = $score;
                $existingAnswer->question_snapshot = $snapshot;
                if ($existingAnswer->answer === null) {
                    $existingAnswer->answer = [];
                }
                $existingAnswer->save();

                $totalScore += $score * $questionMaxScore;
            } else {
                $this->testRepository->createAnswer(
                    $attemptId,
                    $question->id,
                    null,
                    false,
                    0,
                    $snapshot
                );
            }
        }

        $totalPoints = $maxScore > 0 ? $maxScore : $attempt->test->questions->sum(fn($q) => $q->pivot->score ?? 1);
        $percentageScore = $totalPoints > 0 ? ($totalScore / $totalPoints) * 100 : 0;

        $this->testRepository->updateAttempt($attemptId, [
            'status' => TestAttempt::STATUS_EXPIRED,
            'submitted_at' => now(),
            'score' => round($percentageScore, 2),
            'earned_points' => round($totalScore, 2),
            'total_points' => round($totalPoints, 2),
        ]);
    }

    private function formatAttemptResponse(TestAttempt $attempt): array
    {
        $test = $this->testRepository->getTestWithQuestions($attempt->test_id);

        // Get existing answers for resume
        $existingAnswers = TestAnswer::where('attempt_id', $attempt->id)
            ->get()
            ->keyBy('question_id')
            ->map(fn($a) => $a->answer)
            ->toArray();

        $questions = $test->questions->map(function ($question) {
            return [
                'id' => $question->id,
                'type' => $question->type,
                'content' => $question->content,
                'data' => $question->data,
                'media_image' => $question->media_image,
                'media_audio' => $question->media_audio,
                'score' => $question->score ?? 1,
                'order_index' => $question->order_index,
            ];
        });

        return [
            'success' => true,
            'attempt_id' => $attempt->id,
            'test_id' => $attempt->test_id,
            'test_title' => $test->title,
            'duration' => $test->duration,
            'started_at' => $attempt->started_at,
            'expired_at' => $attempt->expired_at,
            'remaining_time' => $attempt->expired_at
                ? max(
                    0,
                    $attempt->expired_at->timestamp - now()->timestamp
                )
                : null,
            'questions' => $questions,
            'existing_answers' => $existingAnswers,
        ];
    }

    public function saveAnswer(int $attemptId, int $questionId, $answer)
    {
        $attempt = TestAttempt::findOrFail($attemptId);

        if ($attempt->status != TestAttempt::STATUS_IN_PROGRESS) {
            return;
        }

        TestAnswer::updateOrCreate(
            [
                'attempt_id'=>$attemptId,
                'question_id'=>$questionId,
            ],
            [
                'answer'=>$answer,
                'is_correct'=>null
            ]
        );
    }

    public function getClassScores(int $classId, int $testId): array
    {
        $test = $this->getTestById($testId);
        $attempts = $this->testRepository->getClassScores($classId, $testId);

        $maxPoints = $test->testQuestions->sum('score');

        return [
            'test' => [
                'id' => $test->id,
                'title' => $test->title,
                'total_questions' => $test->questions->count(),
                'max_points' => $maxPoints,
            ],
            'scores' => $attempts->map(function ($attempt) use ($maxPoints) {
                $earnedPoints = 0;
                foreach ($attempt->answers as $answer) {
                    $question = $attempt->test->questions->firstWhere('id', $answer->question_id);
                    $questionScore = $question && isset($question->pivot->score) ? (float) $question->pivot->score : 1.0;
                    $scoreRatio = $answer->score ?? ($answer->is_correct ? 1.0 : 0.0);
                    $earnedPoints += $scoreRatio * $questionScore;
                }
                return [
                    'student_id' => $attempt->user_id,
                    'student_name' => $attempt->user->name ?? 'N/A',
                    'email' => $attempt->user->email ?? 'N/A',
                    'phone' => $attempt->user->phone ?? 'N/A',
                    'status' => $attempt->status,
                    'submitted_at' => $attempt->submitted_at,
                    'attempt_no' => $attempt->attempt_no,
                    'earned_points' => $earnedPoints,
                    'max_points' => $maxPoints,
                ];
            })->values()->toArray(),
        ];
    }
}
