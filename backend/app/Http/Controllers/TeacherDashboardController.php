<?php

namespace App\Http\Controllers;

use App\Services\DashboardTeacherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherDashboardController extends Controller
{
    public function __construct(
        private readonly DashboardTeacherService $dashboardService
    ) {}

    public function getStats(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;
        $result = $this->dashboardService->getDashboardStats($teacherId);

        return response()->json($result);
    }
}
