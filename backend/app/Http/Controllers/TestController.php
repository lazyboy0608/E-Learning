<?php

namespace App\Http\Controllers;

use App\Http\Requests\Test\StoreTestRequest;
use App\Http\Requests\Test\UpdateTestRequest;
use App\Http\Requests\Test\SubmitTestRequest;
use App\Services\TestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function __construct(
        private readonly TestService $testService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [];

        if ($request->has('subject_id')) {
            $filters['subject_id'] = $request->input('subject_id');
        }

        if ($request->has('is_active')) {
            $filters['is_active'] = $request->boolean('is_active');
        }

        $user = $request->user();

        if ($user->role === 'admin') {
            $filters['scope'] = 'system';
        }
        
        if ($user->role === 'teacher') {
            $filters['scope'] = 'class';
            $filters['created_by'] = $user->id;
        }

        $tests = $this->testService->getAllTests(
            $filters,
            $user
        );

        return $this->successResponse(
            \App\Http\Resources\TestResource::collection($tests),
            'Lấy danh sách bài test thành công'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $test = $this->testService->getTestWithQuestions($id);
            $test->load(['subject', 'classes']);
            $test->attempts_count = $test->attempts()->count();

            return $this->successResponse(
                new \App\Http\Resources\TestResource($test),
                'Lấy chi tiết bài test thành công'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Bài test không tồn tại', 404);
        }
    }

    public function store(StoreTestRequest $request): JsonResponse
    {
        $user = $request->user();

        \Log::info('STORE TEST', $request->validated());

        // Only teachers and admins can create tests
        if (!in_array($user->role, ['teacher', 'admin'])) {
            return $this->errorResponse('Bạn không có quyền tạo bài test', 403);
        }

        $test = $this->testService->createTest($user->id, $request->validated());

        return $this->successResponse(
            new \App\Http\Resources\TestResource($test),
            'Tạo bài test thành công',
            201
        );
    }

    public function update(UpdateTestRequest $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $test = $this->testService->getTestById($id);

            // Only creator or admin can update
            if ($test->created_by !== $user->id && $user->role !== 'admin') {
                return $this->errorResponse('Bạn không có quyền cập nhật bài test này', 403);
            }

            $updatedTest = $this->testService->updateTest($id, $request->validated());

            return $this->successResponse(
                new \App\Http\Resources\TestResource($updatedTest),
                'Cập nhật bài test thành công'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Bài test không tồn tại', 404);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $test = $this->testService->getTestById($id);

            // Only creator or admin can delete
            if ($test->created_by !== $user->id && $user->role !== 'admin') {
                return $this->errorResponse('Bạn không có quyền xóa bài test này', 403);
            }

            $this->testService->deleteTest($id);

            return $this->successResponse(null, 'Xóa bài test thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Bài test không tồn tại', 404);
        }
    }

    public function start(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $result = $this->testService->startTest($user->id, $id);

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 400);
        }

        return $this->successResponse($result, 'Bắt đầu làm bài test thành công');
    }

    public function submit(SubmitTestRequest $request, int $id): JsonResponse
    {
        $user = $request->user();
        $attemptId = $request->input('attempt_id');
        $answers = $request->input('answers', []);

        $result = $this->testService->submitTest($attemptId, $answers);

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 400);
        }

        return $this->successResponse($result, 'Nộp bài test thành công');
    }

    public function allAttempts(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $test = $this->testService->getTestById($id);

            // Only creator or admin can view all attempts
            if ($test->created_by !== $user->id && $user->role !== 'admin') {
                return $this->errorResponse('Bạn không có quyền xem lượt làm bài của bài test này', 403);
            }

            $attempts = $this->testService->getAllAttemptsForTest($id);

            return $this->successResponse($attempts, 'Lấy danh sách lượt làm bài thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Bài test không tồn tại', 404);
        }
    }

    public function myAttempts(Request $request): JsonResponse
    {
        $user = $request->user();

        $attempts = $this->testService->getMyAttempts($user->id);

        return $this->successResponse($attempts, 'Lấy lịch sử làm bài thành công');
    }

    public function results(int $attemptId): JsonResponse
    {
        try {
            $results = $this->testService->getResults($attemptId);

            return $this->successResponse($results, 'Lấy kết quả làm bài thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Lượt làm bài không tồn tại', 404);
        }
    }

    public function review(int $attemptId): JsonResponse
    {
        try {
            $review = $this->testService->getReview($attemptId);
            return $this->successResponse($review, 'Lấy bài làm chi tiết thành công');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function accessByCode(Request $request, string $code): JsonResponse
    {
        $test = $this->testService->getTestByCode($code);

        if (!$test) {
            return $this->errorResponse('Không tìm thấy bài test với mã code này', 404);
        }

        return $this->successResponse([
            'id' => $test->id,
            'title' => $test->title,
            'subject' => $test->subject->name ?? null,
            'duration' => $test->duration,
            'question_count' => $test->questions->count(),
            'access_type' => $test->access_type,
        ], 'Tìm thấy bài test');
    }

    public function available(Request $request): JsonResponse
    {
        $user = $request->user();

        $tests = $this->testService->getAvailableTests($user->id);

        return $this->successResponse(
            \App\Http\Resources\TestResource::collection($tests),
            'Lấy danh sách bài test có sẵn thành công'
        );
    }

    public function systemTests(Request $request): JsonResponse
    {
        $tests = $this->testService->getSystemTests();

        return $this->successResponse(
            \App\Http\Resources\TestResource::collection($tests),
            'Lấy danh sách bài test hệ thống thành công'
        );
    }

    public function saveAnswer(Request $request)
    {
        $this->testService->saveAnswer(
            $request->attempt_id,
            $request->question_id,
            $request->answer
        );
        return $this->successResponse(null, 'Lưu câu trả lời thành công');
    }

    public function classScores(Request $request, int $classId, int $testId): JsonResponse
    {
        $user = $request->user();

        try {
            $test = $this->testService->getTestById($testId);
            if ($test->created_by !== $user->id && $user->role !== 'admin') {
                return $this->errorResponse('Bạn không có quyền xem điểm lớp học cho bài test này', 403);
            }

            $data = $this->testService->getClassScores($classId, $testId);

            return $this->successResponse($data, 'Lấy bảng điểm lớp học thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Bài test không tồn tại', 404);
        }
    }

    public function reportTabSwitch(Request $request, int $attemptId): JsonResponse
    {
        $attempt = \App\Models\TestAttempt::findOrFail($attemptId);
        
        // Chỉ cho phép học sinh sở hữu lượt thi và lượt thi đang in_progress ghi nhận
        if ($attempt->user_id !== $request->user()->id || $attempt->status !== \App\Models\TestAttempt::STATUS_IN_PROGRESS) {
            return $this->errorResponse('Yêu cầu không hợp lệ hoặc lượt thi đã kết thúc.', 400);
        }

        $attempt->increment('tab_switch_count');

        return $this->successResponse([
            'tab_switch_count' => $attempt->tab_switch_count
        ], 'Ghi nhận chuyển tab thành công.');
    }
}
