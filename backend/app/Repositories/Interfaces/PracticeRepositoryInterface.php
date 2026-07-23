<?php

namespace App\Repositories\Interfaces;

use App\Models\Practice;
use Illuminate\Database\Eloquent\Collection;

interface PracticeRepositoryInterface
{
    public function getAllByUser(int $userId): Collection;
    public function getById(int $id): ?Practice;
    public function create(array $data): Practice;
    public function update(int $id, array $data): ?Practice;
    public function delete(int $id): bool;
    public function getStudentPractices(int $userId): Collection;
}
