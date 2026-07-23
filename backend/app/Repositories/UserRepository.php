<?php

namespace App\Repositories;

use App\Models\TestAttempt;
use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UserRepository implements UserRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = User::query();

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getById(int $id): ?User
    {
        return User::find($id);
    }

    public function update(int $id, array $data): ?User
    {
        $user = User::find($id);

        if (!$user) {
            return null;
        }

        $user->update($data);

        return $user->fresh();
    }

    public function delete(int $id): bool
    {
        $user = User::find($id);

        if (!$user) {
            return false;
        }

        return (bool) $user->delete();
    }

    public function getByRole(string $role): Collection
    {
        return User::where('role', $role)
            ->orderBy('name')
            ->get();
    }

    public function getCounts(): array
    {
        $newUsers = User::select(
                DB::raw('date(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(14))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $attempts = TestAttempt::select(
                DB::raw('date(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(14))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'teachers_count'  => User::where('role', 'teacher')->orWhere('role', 'admin')->count(),
            'students_count'  => User::where('role', 'student')->count(),
            'daily_new_users' => $newUsers,
            'daily_attempts'  => $attempts,
        ];
    }
}
