<?php

namespace App\Http\Controllers;

use App\Services\FeedbackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function __construct(
        private readonly FeedbackService $feedbackService
    ) {}

    /**
     * Học sinh/Giáo viên gửi phản hồi mới
     * POST /api/feedbacks
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'    => 'required|string|in:bug,suggestion,complaint,other',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $feedback = $this->feedbackService->createFeedback(
            $request->user()->id,
            $validated
        );

        return $this->successResponse($feedback, 'Gửi phản hồi thành công.', 201);
    }

    /**
     * Học sinh/Giáo viên xem phản hồi của mình
     * GET /api/feedbacks/mine
     */
    public function mine(Request $request): JsonResponse
    {
        $feedbacks = $this->feedbackService->getMyFeedbacks($request->user()->id);
        return $this->successResponse($feedbacks);
    }

    /**
     * Admin xem tất cả phản hồi (có lọc và phân trang)
     * GET /api/admin/feedbacks
     */
    public function index(Request $request): JsonResponse
    {
        $filters   = $request->only(['status', 'type', 'search', 'per_page']);
        $feedbacks = $this->feedbackService->getAll($filters);
        return $this->successResponse($feedbacks);
    }

    /**
     * Admin trả lời phản hồi
     * POST /api/admin/feedbacks/{id}/reply
     */
    public function reply(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reply' => 'required|string|max:5000',
        ]);

        $result = $this->feedbackService->replyFeedback($id, $validated['reply']);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 404);
        }

        return $this->successResponse($result['data'], 'Đã gửi phản hồi.');
    }

    /**
     * Admin cập nhật trạng thái phản hồi
     * PATCH /api/admin/feedbacks/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,replied,resolved',
        ]);

        $result = $this->feedbackService->updateStatus($id, $validated['status']);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse($result['data'], 'Cập nhật trạng thái thành công.');
    }
}
