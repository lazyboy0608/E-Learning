<?php

namespace App\Http\Controllers;

use App\Http\Requests\Question\CreateQuestionRequest;
use App\Http\Requests\Question\UpdateQuestionRequest;
use App\Services\QuestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function __construct(
        private readonly QuestionService $questionService
    ) {}

    // System Questions (Admin)
    public function indexSystem(Request $request): JsonResponse
    {
        $filters = $request->only(['subject_id', 'type', 'per_page']);
        $filters['scope'] = 'system';
        $questions = $this->questionService->getAllQuestions($filters);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách câu hỏi hệ thống thành công',
            'data' => \App\Http\Resources\QuestionResource::collection($questions->items()),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
            ],
        ]);
    }

    public function storeSystem(CreateQuestionRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['scope'] = 'system';
            $question = $this->questionService->createQuestion($data, $request->user()->id);
            return $this->successResponse(
                new \App\Http\Resources\QuestionResource($question),
                'Tạo câu hỏi hệ thống thành công',
                201
            );
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateSystem(UpdateQuestionRequest $request, int $id): JsonResponse
    {
        try {
            $question = $this->questionService->getQuestion($id);
            if ($question->scope !== 'system') {
                return $this->errorResponse('Không thể cập nhật câu hỏi không thuộc hệ thống', 403);
            }
            $updatedQuestion = $this->questionService->updateQuestion($id, $request->validated());
            return $this->successResponse(
                new \App\Http\Resources\QuestionResource($updatedQuestion),
                'Cập nhật câu hỏi hệ thống thành công'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroySystem(int $id): JsonResponse
    {
        \Log::info('DELETE SYSTEM QUESTION', [
            'question_id' => $id,
            'user' => auth()->user()?->toArray()
        ]);

        $question = $this->questionService->getQuestion($id);

        \Log::info('QUESTION DATA', [
            'scope' => $question->scope
        ]);
        
        if ($question->scope !== 'system') {
            return $this->errorResponse('Không thể xóa câu hỏi không thuộc hệ thống', 403);
        }
        $this->questionService->deleteQuestion($id);
        return $this->successResponse(null, 'Xoá câu hỏi hệ thống thành công');
    }

    // Class Questions (Teacher + Admin)
    public function indexClass(Request $request): JsonResponse
    {
        $filters = $request->only(['subject_id', 'type', 'per_page']);
        $filters['scope'] = 'class';
        $filters['created_by'] = $request->user()->id;
        $questions = $this->questionService->getAllQuestions($filters);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách câu hỏi lớp học thành công',
            'data' => \App\Http\Resources\QuestionResource::collection($questions->items()),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
            ],
        ]);
    }

    public function storeClass(CreateQuestionRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['scope'] = 'class';
            $question = $this->questionService->createQuestion($data, $request->user()->id);
            return $this->successResponse(
                new \App\Http\Resources\QuestionResource($question),
                'Tạo câu hỏi lớp học thành công',
                201
            );
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateClass(UpdateQuestionRequest $request, int $id): JsonResponse
    {
        try {
            $question = $this->questionService->getQuestion($id);
            // Teacher can only update their own class questions
            if ($question->scope === 'class' && $question->created_by !== $request->user()->id && $request->user()->role !== 'admin') {
                return $this->errorResponse('Không có quyền cập nhật câu hỏi này', 403);
            }
            $updatedQuestion = $this->questionService->updateQuestion($id, $request->validated());
            return $this->successResponse(
                new \App\Http\Resources\QuestionResource($updatedQuestion),
                'Cập nhật câu hỏi thành công'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroyClass(int $id): JsonResponse
    {
        $question = $this->questionService->getQuestion($id);
        // Teacher can only delete their own class questions
        if ($question->scope === 'class' && $question->created_by !== auth()->id() && auth()->user()->role !== 'admin') {
            return $this->errorResponse('Không có quyền xóa câu hỏi này', 403);
        }
        $this->questionService->deleteQuestion($id);
        return $this->successResponse(null, 'Xoá câu hỏi thành công');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $question = $this->questionService->getQuestion($id);
            return $this->successResponse(
                new \App\Http\Resources\QuestionResource($question),
                'Lấy chi tiết câu hỏi thành công'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Không tìm thấy câu hỏi', 404);
        }
    }

    public function checkAnswer(Request $request, int $id): JsonResponse
    {
        $result = $this->questionService->checkAnswer($id, $request->input('answer'));
        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}
