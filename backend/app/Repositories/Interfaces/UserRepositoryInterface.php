<?php

namespace App\Repositories\Interfaces;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;
    public function getById(int $id): ?User;
    public function update(int $id, array $data): ?User;
    public function delete(int $id): bool;
    public function getByRole(string $role): Collection;
    public function getCounts(): array;
}
