<?php

namespace App\Http\Controllers;

use App\Http\Requests\Class\StoreClassRequest;
use App\Http\Requests\Class\UpdateClassRequest;
use App\Http\Requests\Class\JoinClassRequest;
use App\Http\Requests\Class\AddMemberRequest;
use App\Http\Requests\Class\StoreMaterialRequest;
use App\Http\Requests\Class\AssignTestRequest;
use App\Http\Requests\Class\AssignPracticeRequest;
use App\Services\ClassService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function __construct(
        private readonly ClassService $classService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = $request->only(['search']);

        $classes = $this->classService->getAllClasses($filters, $user->id);

        return $this->successResponse(
            \App\Http\Resources\ClassResource::collection($classes),
            'Lấy danh sách lớp học thành công'
        );
    }

    public function search(Request $request): JsonResponse
    {
        $classes = $this->classService->searchClasses((string) $request->query('q', ''));

        return $this->successResponse(
            \App\Http\Resources\ClassResource::collection($classes),
            'Tìm kiếm lớp học thành công'
        );
    }

    public function show(int $classId): JsonResponse
    {
        $class = $this->classService->getClassDetail($classId);

        if (!$class) {
            return $this->errorResponse('Lớp học không tồn tại.', 404);
        }

        return $this->successResponse(
            new \App\Http\Resources\ClassResource($class),
            'Lấy chi tiết lớp học thành công'
        );
    }

    public function store(StoreClassRequest $request): JsonResponse
    {
        $user = $request->user();

        $class = $this->classService->createClass(
            $user->id,
            $request->validated()
        );

        return $this->successResponse(
            new \App\Http\Resources\ClassResource($class),
            'Tao lớp học thành công.',
            201
        );
    }

    public function update(UpdateClassRequest $request, int $classId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền chỉnh sửa lớp học này.', 403);
        }

        try {
            $class = $this->classService->updateClass($classId, $request->validated());

            return $this->successResponse(
                new \App\Http\Resources\ClassResource($class),
                'Cập nhật lớp học thành công.'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(Request $request, int $classId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền xóa lớp học này.', 403);
        }

        $this->classService->deleteClass($classId);

        return $this->successResponse(null, 'Xóa lớp học thành công.');
    }

    public function join(JoinClassRequest $request): JsonResponse
    {
        $user = $request->user();

        $result = $this->classService->joinClass(
            $user->id,
            $request->input('class_code')
        );

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse(
            new \App\Http\Resources\ClassResource($result['class']),
            $result['message']
        );
    }

    public function leave(Request $request, int $classId): JsonResponse
    {
        $user = $request->user();

        $result = $this->classService->leaveClass($user->id, $classId);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse(null, $result['message']);
    }

    public function students(int $classId): JsonResponse
    {
        $students = $this->classService->getStudents($classId);

        return $this->successResponse(
            \App\Http\Resources\UserResource::collection($students),
            'Lấy danh sách học sinh thành công'
        );
    }

    public function addStudent(AddMemberRequest $request, int $classId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền thêm học sinh.', 403);
        }

        $result = $this->classService->addStudent($classId, $request->input('user_id'));

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse(null, $result['message']);
    }

    public function removeStudent(Request $request, int $classId, int $userId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền xóa học sinh.', 403);
        }

        $result = $this->classService->removeStudent($classId, $userId);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse(null, $result['message']);
    }

    public function teachers(int $classId): JsonResponse
    {
        $teachers = $this->classService->getTeachers($classId);

        return $this->successResponse(
            \App\Http\Resources\UserResource::collection($teachers),
            'Lấy danh sách giáo viên thành công'
        );
    }

    public function addTeacher(AddMemberRequest $request, int $classId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền thêm giáo viên.', 403);
        }

        $result = $this->classService->addTeacher($classId, $request->input('user_id'));

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse(null, $result['message']);
    }

    public function removeTeacher(Request $request, int $classId, int $userId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền xóa giáo viên.', 403);
        }

        $result = $this->classService->removeTeacher($classId, $userId);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse(null, $result['message']);
    }

    public function materials(int $classId): JsonResponse
    {
        $materials = $this->classService->getMaterials($classId);

        return $this->successResponse($materials, 'Lấy danh sách tài liệu thành công');
    }

    public function storeMaterial(StoreMaterialRequest $request, int $classId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền thêm tài liệu.', 403);
        }

        $material = $this->classService->addMaterial($classId, $request->validated());

        return $this->successResponse($material, 'Thêm tài liệu thành công.', 201);
    }

    public function removeMaterial(Request $request, int $classId, int $materialId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền xóa tài liệu.', 403);
        }

        $this->classService->removeMaterial($classId, $materialId);

        return $this->successResponse(null, 'Xóa tài liệu thành công.');
    }

    public function tests(int $classId): JsonResponse
    {
        $tests = $this->classService->getTests($classId);

        return $this->successResponse(
            \App\Http\Resources\TestResource::collection($tests),
            'Lấy danh sách bài test của lớp học thành công'
        );
    }

    public function assignTest(AssignTestRequest $request, int $classId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền gán bài kiểm tra.', 403);
        }

        $result = $this->classService->assignTest($classId, $request->input('test_id'));

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse(null, $result['message']);
    }

    public function removeTest(Request $request, int $classId, int $testId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền xóa bài kiểm tra.', 403);
        }

        $this->classService->removeTest($classId, $testId);

        return $this->successResponse(null, 'Xóa bài kiểm tra thành công.');
    }

    public function practices(int $classId): JsonResponse
    {
        $practices = $this->classService->getPractices($classId);

        return $this->successResponse($practices, 'Lấy danh sách bài ôn tập thành công');
    }

    public function assignPractice(AssignPracticeRequest $request, int $classId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền gán bài ôn tập.', 403);
        }

        $result = $this->classService->assignPractice($classId, $request->input('practice_id'));

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }

        return $this->successResponse(null, $result['message']);
    }

    public function removePractice(Request $request, int $classId, int $practiceId): JsonResponse
    {
        $user = $request->user();

        if (!$this->classService->canManageClass($user->id, $classId)) {
            return $this->errorResponse('Bạn không có quyền xóa bài ôn tập.', 403);
        }

        $this->classService->removePractice($classId, $practiceId);

        return $this->successResponse(null, 'Xóa bài ôn tập thành công.');
    }
}
