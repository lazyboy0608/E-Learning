<?php

namespace App\Repositories\Interfaces;

use App\Models\Feedback;
use Illuminate\Pagination\LengthAwarePaginator;

interface FeedbackRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;
    public function getById(int $id): ?Feedback;
    public function create(array $data): Feedback;
    public function update(int $id, array $data): ?Feedback;
}
