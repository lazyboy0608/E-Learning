<?php

namespace App\Repositories;

use App\Models\Test;
use App\Models\User;
use App\Models\TestAttempt;
use App\Models\TestAnswer;
use App\Models\TestQuestion;
use App\Models\ClassModel;
use App\Models\ClassUser;
use App\Notifications\AssignmentCreatedByTeacherNotification;
use App\Notifications\NewAssignmentForStudentNotification;
use App\Events\NotificationCreated;
use App\Repositories\Interfaces\TestRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Model;

class TestRepository implements TestRepositoryInterface
{
    public function getAll(array $filters = [], User $user): Collection
    {
        $query = Test::with(['subject', 'creator', 'questions'])->withCount('questions');

        if (isset($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (isset($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if ($user->role === 'teacher') {

            $query->where('scope', 'class')
                  ->where('created_by', $user->id);
        
        }
        
        if ($user->role === 'admin') {
        
            $query->where('scope', 'system');
        
        }

        if (isset($filters['scope'])) {
            $query->where('scope', $filters['scope']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getById(int $id): Model
    {
        return Test::with(['subject', 'creator', 'questions'])->findOrFail($id);
    }

    public function getByCode(string $code): ?Model
    {
        return Test::with(['subject', 'creator'])
            ->where('test_code', $code)
            ->where('is_active', true)
            ->first();
    }

    public function getQuestions(int $testId): Collection
    {
        return TestQuestion::where('test_id', $testId)
            ->with(['question'])
            ->orderBy('order_index')
            ->get();
    }

    public function getAttempts(int $userId, ?int $testId = null): Collection
    {
        $query = TestAttempt::where('user_id', $userId)
            ->with(['test', 'test.subject', 'answers', 'test.questions']);

        if ($testId) {
            $query->where('test_id', $testId);
        }

        return $query->orderBy('started_at', 'desc')->get();
    }

    public function getAttemptsByTestId(int $testId): Collection
    {
        return TestAttempt::where('test_id', $testId)
            ->with(['user', 'test.subject'])
            ->orderBy('submitted_at', 'desc')
            ->get();
    }

    public function findLatestAttempt(int $userId, int $testId)
    {
        return TestAttempt::where('user_id', $userId)
            ->where('test_id', $testId)
            ->latest()
            ->first();
    }

    public function getTestWithQuestions(int $id): Model
    {
        return Test::with([
            'subject',
            'creator',
            'questions'
        ])->findOrFail($id);
    }

    public function getAvailableTestsForUser(int $userId): Collection {

        $classIds = ClassUser::where(
            'user_id',
            $userId
        )->pluck('class_id');

        return Test::with([
            'subject',
            'creator',
            'classes'
        ])->withCount('questions')
            ->where('is_active', true)

            ->where(function ($q) {

                $q->whereNull('expires_at')
                    ->orWhere(
                        'expires_at',
                        '>',
                        now()
                    );
            })

            ->where(function ($q) use ($classIds) {

                $q->whereIn(
                    'access_type',
                    [
                        'public_code',
                        'both'
                    ]
                )

                    ->orWhere(function ($q2) use ($classIds) {

                        $q2
                            ->where(
                                'access_type',
                                'class_only'
                            )

                            ->whereHas(
                                'classes',
                                function ($c) use ($classIds) {

                                    $c->whereIn(
                                        'classes.id',
                                        $classIds
                                    );
                                }
                            );
                    });
            })

            ->orderByDesc('created_at')
            ->get();
    }
    public function getSystemTests(): Collection
    {
        return Test::with(['subject', 'creator', 'testQuestions'])->withCount('questions')
            ->where('scope', 'system')
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getActiveAttempt(int $userId, int $testId): ?Model
    {
        return TestAttempt::where('user_id', $userId)
            ->where('test_id', $testId)
            ->where('status', TestAttempt::STATUS_IN_PROGRESS)
            ->where(function ($q) {
                $q->whereNull('expired_at')
                    ->orWhere('expired_at', '>', now());
            })
            ->first();
    }

    public function createTest(array $data): Model
    {
        // Generate unique test code
        if (!isset($data['test_code'])) {
            $data['test_code'] = $this->generateTestCode();
        }

        $test = Test::create($data);

        if (!empty($data['class_ids'])) {
            $test->classes()->attach(
                $data['class_ids']
            );
        }

        // Attach questions if provided
        if (isset($data['question_ids']) && is_array($data['question_ids'])) {
            $questions = [];
            foreach ($data['question_ids'] as $index => $questionId) {
                $questions[$questionId] = [
                    'order_index' => $index + 1,
                    'score' => $data['question_scores'][$questionId] ?? 1,
                ];
            }
            $test->questions()->attach($questions);
        }

        return $test->load(['subject', 'creator', 'questions']);
    }

    public function updateTest(int $id, array $data): Model
    {
        $test = Test::findOrFail($id);
        $test->update($data);

        if (isset($data['class_ids'])) {

            $test->classes()->sync(
                $data['class_ids']
            );

            $test->load(['creator', 'classes.students']);
            $assignmentName = $test->title;
            $type = 'test';

            foreach ($test->classes as $class) {
                $teacher = $test->creator;
                if ($teacher) {
                    $teacher->notify(new AssignmentCreatedByTeacherNotification(
                        $assignmentName,
                        $class->name,
                        $type
                    ));
                    event(new NotificationCreated($teacher->id));
                }

                foreach ($class->students as $student) {
                    $student->notify(new NewAssignmentForStudentNotification(
                        $assignmentName,
                        $teacher->name ?? 'Giáo viên',
                        $type
                    ));
                    event(new NotificationCreated($student->id));
                }
            }
        }

        // Update questions if provided
        if (isset($data['question_ids']) && is_array($data['question_ids'])) {
            $questions = [];
            foreach ($data['question_ids'] as $index => $questionId) {
                $questions[$questionId] = [
                    'order_index' => $index + 1,
                    'score' => $data['question_scores'][$questionId] ?? 1,
                ];
            }
            $test->questions()->sync($questions);
        }

        return $test->load(['subject', 'creator', 'questions']);
    }

    public function deleteTest(int $id): bool
    {
        $test = Test::findOrFail($id);
        return $test->delete();
    }

    public function createAttempt(int $userId, int $testId): Model
    {
        $test = Test::findOrFail($testId);

        // Count existing attempts
        $attemptNo = TestAttempt::where(
            'user_id',
            $userId
        )
        ->where(
            'test_id',
            $testId
        )
        ->lockForUpdate()
        ->max('attempt_no');

        $attemptNo = ($attemptNo ?? 0) + 1;

        // Calculate expiration time
        $expiredAt = null;
        if ($test->duration) {
            $expiredAt = now()->addMinutes($test->duration);
        }

        return TestAttempt::create([
            'user_id' => $userId,
            'test_id' => $testId,
            'attempt_no' => $attemptNo,
            'started_at' => now(),
            'expired_at' => $expiredAt,
            'status' => TestAttempt::STATUS_IN_PROGRESS,
        ]);
    }

    public function updateAttempt(int $attemptId, array $data): Model
    {
        $attempt = TestAttempt::findOrFail($attemptId);
        $attempt->update($data);
        return $attempt;
    }

    public function createAnswer(int $attemptId, int $questionId, mixed $answer, bool $isCorrect, float $score = 0.0): Model
    {
        return TestAnswer::updateOrCreate(
            [
                'attempt_id' => $attemptId,
                'question_id' => $questionId,
            ],
            [
                'answer' => $answer,
                'is_correct' => $isCorrect,
                'score' => $score,
            ]
        );
    }

    public function getAttemptWithAnswers(int $attemptId): Model
    {
        return TestAttempt::with([
            'test',
            'test.subject',
            'test.questions.question',
            'answers.question'
        ])->findOrFail($attemptId);
    }

    private function generateTestCode(): string
    {
        do {
            $code = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
        } while (Test::where('test_code', $code)->exists());
        return $code;
    }

    public function getClassScores(int $classId, int $testId): Collection
    {
        $studentUserIds = ClassUser::where('class_id', $classId)
            ->where('role', 'student')
            ->pluck('user_id');

        return TestAttempt::where('test_id', $testId)
            ->whereIn('user_id', $studentUserIds)
            ->whereIn('status', [TestAttempt::STATUS_SUBMITTED, TestAttempt::STATUS_EXPIRED])
            ->with(['user:id,name,email,phone', 'answers', 'test.testQuestions', 'test.questions' => fn($q) => $q->withPivot('score')])
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->groupBy('user_id')
            ->map(fn($attempts) => $attempts->first());
    }
}
