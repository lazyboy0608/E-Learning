<?php

namespace App\Repositories;

use App\Models\Feedback;
use App\Repositories\Interfaces\FeedbackRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class FeedbackRepository implements FeedbackRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Feedback::with('user:id,name,email,role')
            ->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    public function getById(int $id): ?Feedback
    {
        return Feedback::with('user:id,name,email,role')->find($id);
    }

    public function create(array $data): Feedback
    {
        return Feedback::create($data);
    }

    public function update(int $id, array $data): ?Feedback
    {
        $feedback = Feedback::find($id);

        if (!$feedback) {
            return null;
        }

        $feedback->update($data);

        return $feedback->fresh(['user']);
    }
}
