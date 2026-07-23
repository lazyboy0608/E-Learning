<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UpdateUserRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['role', 'search', 'per_page']);
        $users   = $this->userService->getUsers($filters);

        return response()->json([
            'success' => true,
            'data'    => $users->items(),
            'meta'    => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUser($id);

        if (!$user) {
            return $this->errorResponse('Không tìm thấy người dùng.', 404);
        }

        return $this->successResponse($user);
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $result = $this->userService->updateUser($id, $request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse($result['user'], 'Cập nhật thành công.');
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->userService->deleteUser($id);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse(null, 'Xóa người dùng thành công.');
    }

    public function teachers(): JsonResponse
    {
        return $this->successResponse($this->userService->getTeachers());
    }

    public function students(): JsonResponse
    {
        return $this->successResponse($this->userService->getStudents());
    }
}
