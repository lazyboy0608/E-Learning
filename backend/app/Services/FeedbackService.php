<?php

namespace App\Services;

use App\Models\Feedback;
use App\Repositories\Interfaces\FeedbackRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class FeedbackService
{
    public function __construct(
        private readonly FeedbackRepositoryInterface $feedbackRepository
    ) {}

    /**
     * Học sinh/Giáo viên gửi phản hồi
     */
    public function createFeedback(int $userId, array $data): Feedback
    {
        $feedback = $this->feedbackRepository->create([
            'user_id' => $userId,
            'type'    => $data['type'],
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status'  => Feedback::STATUS_PENDING,
        ]);

        return $feedback;
    }

    /**
     * Admin lấy danh sách phản hồi có lọc và phân trang
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->feedbackRepository->getAll($filters);
    }

    /**
     * Admin trả lời và cập nhật trạng thái phản hồi
     */
    public function replyFeedback(int $id, string $reply): array
    {
        $feedback = $this->feedbackRepository->getById($id);

        if (!$feedback) {
            return ['success' => false, 'message' => 'Không tìm thấy phản hồi.'];
        }

        $updated = $this->feedbackRepository->update($id, [
            'admin_reply' => $reply,
            'status'      => Feedback::STATUS_REPLIED,
        ]);

        return ['success' => true, 'data' => $updated];
    }

    /**
     * Admin cập nhật trạng thái phản hồi (resolved/rejected)
     */
    public function updateStatus(int $id, string $status): array
    {
        $allowedStatuses = [
            Feedback::STATUS_PENDING,
            Feedback::STATUS_REPLIED,
            Feedback::STATUS_RESOLVED,
        ];

        if (!in_array($status, $allowedStatuses)) {
            return ['success' => false, 'message' => 'Trạng thái không hợp lệ.'];
        }

        $feedback = $this->feedbackRepository->getById($id);

        if (!$feedback) {
            return ['success' => false, 'message' => 'Không tìm thấy phản hồi.'];
        }

        $updated = $this->feedbackRepository->update($id, ['status' => $status]);

        return ['success' => true, 'data' => $updated];
    }

    /**
     * Học sinh/Giáo viên xem phản hồi của mình
     */
    public function getMyFeedbacks(int $userId): LengthAwarePaginator
    {
        return $this->feedbackRepository->getAll(['user_id' => $userId]);
    }
}
