<?php

namespace App\Http\Controllers;

use App\Events\NotificationCreated;
use App\Http\Requests\Practice\SubmitAnswerRequest;
use App\Notifications\AssignmentCreatedByTeacherNotification;
use App\Notifications\NewAssignmentForStudentNotification;
use App\Services\PracticeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PracticeController extends Controller
{
    public function __construct(
        private readonly PracticeService $practiceService
    ) {}

    // ==================== Teacher Endpoints ====================

    public function index(): JsonResponse
    {
        $practices = $this->practiceService->getAllByUser(auth()->id());
        return $this->successResponse($practices);
    }

    public function show(int $id): JsonResponse
    {
        $user     = auth()->user();
        $practice = $this->practiceService->getById($id);

        if (!$practice) {
            return $this->errorResponse('Practice not found.', 404);
        }

        if ($practice->created_by !== $user->id && $user->role !== 'admin') {
            return $this->errorResponse('Bạn không có quyền xem bài luyện tập này.', 403);
        }

        $practice->load(['subject:id,name', 'classes:id,name', 'questions.question:id,content,type,subject_id']);

        return $this->successResponse($practice);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'subject_id'     => 'required|exists:subjects,id',
            'class_ids'      => 'nullable|array',
            'class_ids.*'    => 'exists:classes,id',
            'description'    => 'nullable|string',
            'question_ids'   => 'nullable|array',
            'question_ids.*' => 'exists:questions,id',
        ]);

        $practice = $this->practiceService->create(auth()->id(), $validated);

        return $this->successResponse($practice, 'Practice created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user     = auth()->user();
        $practice = $this->practiceService->getById($id);

        if (!$practice) {
            return $this->errorResponse('Practice not found.', 404);
        }

        if ($practice->created_by !== $user->id && $user->role !== 'admin') {
            return $this->errorResponse('Bạn không có quyền cập nhật bài luyện tập này.', 403);
        }

        $validated = $request->validate([
            'title'          => 'sometimes|required|string|max:255',
            'subject_id'     => 'sometimes|nullable|exists:subjects,id',
            'description'    => 'nullable|string',
            'question_ids'   => 'nullable|array',
            'question_ids.*' => 'exists:questions,id',
            'class_ids'      => 'nullable|array',
            'class_ids.*'    => 'exists:classes,id',
        ]);

        $updated = $this->practiceService->update($id, $validated);

        // Gửi thông báo cho giáo viên và học sinh nếu có giao lớp mới
        if (isset($validated['class_ids']) && $updated) {
            $updated->load(['creator', 'classes.students']);
            $assignmentName = $updated->title;
            $type = 'practice';

            foreach ($updated->classes as $class) {
                $teacher = $updated->creator;
                if ($teacher) {
                    $teacher->notify(new AssignmentCreatedByTeacherNotification($assignmentName, $class->name, $type));
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

        return $this->successResponse($updated, 'Practice updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $user     = auth()->user();
        $practice = $this->practiceService->getById($id);

        if (!$practice) {
            return $this->errorResponse('Practice not found.', 404);
        }

        if ($practice->created_by !== $user->id && $user->role !== 'admin') {
            return $this->errorResponse('Bạn không có quyền xóa bài luyện tập này.', 403);
        }

        $this->practiceService->delete($id);

        return $this->successResponse(null, 'Practice deleted successfully.');
    }

    // ==================== Student Endpoints ====================

    public function getQuestion(int $id): JsonResponse
    {
        try {
            $question = $this->practiceService->getQuestion($id);
            return $this->successResponse($question);
        } catch (\Exception $e) {
            return $this->errorResponse('Không tìm thấy câu hỏi.', 404);
        }
    }

    public function getRandomQuestions(Request $request): JsonResponse
    {
        $limit     = $request->input('limit', 10);
        $subjectId = $request->input('subject_id');
        $questions = $this->practiceService->getRandomQuestions($limit, $subjectId);
        return $this->successResponse($questions);
    }

    public function getPracticeQuestions(int $id): JsonResponse
    {
        $practice = $this->practiceService->getById($id);

        if (!$practice) {
            return $this->errorResponse('Practice not found.', 404);
        }

        $questions = $this->practiceService->getPracticeQuestions($id);
        return $this->successResponse($questions);
    }

    public function submitAnswer(SubmitAnswerRequest $request): JsonResponse
    {
        $result = $this->practiceService->submitAnswer(
            $request->user()->id,
            $request->input('question_id'),
            $request->input('answer')
        );

        return $this->successResponse($result);
    }

    public function getProgress(): JsonResponse
    {
        $progress = $this->practiceService->getProgress(auth()->id());
        return $this->successResponse($progress);
    }

    public function getStudentPractices(): JsonResponse
    {
        $practices = $this->practiceService->getStudentPractices(auth()->id());
        return $this->successResponse($practices);
    }
}
