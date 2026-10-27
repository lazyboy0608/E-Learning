<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\PracticeController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\TeacherDashboardController;

// Friendly JSON response cho GET /api/login
Route::get('/login', function () {
    return response()->json([
        'message' => 'This endpoint accepts POST requests for authentication. Please POST credentials to /api/login.',
        'hint'    => 'Use POST /api/login with {email, password, role}'
    ], 200);
});

// Authentication Routes (Được bảo vệ bằng Rate Limiting chuyên biệt)
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login')
    ->name('login');

Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:register');

Route::post('/refresh-token', [AuthController::class, 'refreshToken'])
    ->middleware('throttle:refresh-token');

// Protected Routes (Xác thực JWT kép qua HttpOnly Cookie / Bearer Token & Rate Limiting chung)
Route::middleware(['jwt.auth', 'throttle:api'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // System Questions (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/questions', [QuestionController::class, 'indexSystem']);
        Route::post('/admin/questions', [QuestionController::class, 'storeSystem']);
        Route::put('/admin/questions/{id}', [QuestionController::class, 'updateSystem']);
        Route::delete('/admin/questions/{id}', [QuestionController::class, 'destroySystem']);
        Route::get('/admin/stats', function () {
            return response()->json([
                'success' => true,
                'data' => app(\App\Services\UserService::class)->getCounts(),
            ]);
        });
    });

    // Class Questions (Teacher + Admin)
    Route::middleware('role:teacher,admin')->group(function () {
        Route::get('/teacher/questions', [QuestionController::class, 'indexClass']);
        Route::post('/teacher/questions', [QuestionController::class, 'storeClass']);
        Route::put('/teacher/questions/{id}', [QuestionController::class, 'updateClass']);
        Route::delete('/teacher/questions/{id}', [QuestionController::class, 'destroyClass']);
        Route::get('/teacher/dashboard/stats', [TeacherDashboardController::class, 'getStats']);
    });

    // Question details and check answer - All authenticated users
    Route::get('/questions/{id}', [QuestionController::class, 'show']);
    Route::post('/questions/{id}/check', [QuestionController::class, 'checkAnswer']);

    // Practice
    Route::get('/practice/questions/random', [PracticeController::class, 'getRandomQuestions']);
    Route::get('/practice/questions/{id}', [PracticeController::class, 'getQuestion']);
    Route::get('/practices/{id}/questions', [PracticeController::class, 'getPracticeQuestions']);
    Route::post('/practice/check', [PracticeController::class, 'submitAnswer'])->middleware('throttle:assessment');
    Route::get('/practice/progress', [PracticeController::class, 'getProgress']);
    Route::get('/student/practices', [PracticeController::class, 'getStudentPractices']);

    // Teacher Practice Management
    Route::middleware('role:teacher,admin')->group(function () {
        Route::get('/teacher/practices', [PracticeController::class, 'index']);
        Route::get('/teacher/practices/{id}', [PracticeController::class, 'show']);
        Route::post('/teacher/practices', [PracticeController::class, 'store']);
        Route::put('/teacher/practices/{id}', [PracticeController::class, 'update']);
        Route::delete('/teacher/practices/{id}', [PracticeController::class, 'destroy']);
    });
    Route::get('/subjects', [SubjectController::class, 'index']);

    // Tests
    Route::get('/tests', [TestController::class, 'index']);
    Route::get('/tests/available', [TestController::class, 'available']);
    Route::get('/tests/system', [TestController::class, 'systemTests']);
    Route::get('/tests/access/{code}', [TestController::class, 'accessByCode']);

    // Test Results
    Route::get('/tests/attempts', [TestController::class, 'myAttempts']);
    Route::get('/tests/attempts/{attemptId}', [TestController::class, 'results']);
    Route::get('/tests/attempts/{attemptId}/review', [TestController::class, 'review']);
    Route::post('/tests/attempts/{attemptId}/tab-switch', [TestController::class, 'reportTabSwitch']);

    // Test Taking (Được bảo vệ thêm bằng throttle:assessment)
    Route::get('/tests/{id}/attempts', [TestController::class, 'allAttempts']);
    Route::post('/tests/{id}/start', [TestController::class, 'start']);
    Route::post('/tests/{id}/submit', [TestController::class, 'submit'])->middleware('throttle:assessment');
    Route::post('/tests/save-answer', [TestController::class, 'saveAnswer'])->middleware('throttle:assessment');

    Route::get('/tests/{id}', [TestController::class, 'show'])->whereNumber('id');
    Route::post('/tests', [TestController::class, 'store']);
    Route::put('/tests/{id}', [TestController::class, 'update'])->whereNumber('id');
    Route::delete('/tests/{id}', [TestController::class, 'destroy'])->whereNumber('id');

    // Classes
    Route::get('/classes', [ClassController::class, 'index']);
    Route::get('/classes/search', [ClassController::class, 'search']);
    Route::get('/classes/{class}', [ClassController::class, 'show']);
    Route::post('/classes', [ClassController::class, 'store']);
    Route::put('/classes/{class}', [ClassController::class, 'update']);
    Route::delete('/classes/{class}', [ClassController::class, 'destroy']);

    // Join/Leave Class
    Route::post('/classes/join', [ClassController::class, 'join']);
    Route::post('/classes/{class}/leave', [ClassController::class, 'leave']);

    // Class Students
    Route::get('/classes/{class}/students', [ClassController::class, 'students']);
    Route::post('/classes/{class}/students', [ClassController::class, 'addStudent']);
    Route::delete('/classes/{class}/students/{user}', [ClassController::class, 'removeStudent']);

    // Class Teachers
    Route::get('/classes/{class}/teachers', [ClassController::class, 'teachers']);
    Route::post('/classes/{class}/teachers', [ClassController::class, 'addTeacher']);
    Route::delete('/classes/{class}/teachers/{user}', [ClassController::class, 'removeTeacher']);

    // Class Materials
    Route::get('/classes/{class}/materials', [ClassController::class, 'materials']);
    Route::post('/classes/{class}/materials', [ClassController::class, 'storeMaterial']);
    Route::delete('/classes/{class}/materials/{material}', [ClassController::class, 'removeMaterial']);

    // Class Tests
    Route::get('/classes/{class}/tests', [ClassController::class, 'tests']);
    Route::post('/classes/{class}/tests', [ClassController::class, 'assignTest']);
    Route::delete('/classes/{class}/tests/{test}', [ClassController::class, 'removeTest']);

    // Class Scores
    Route::get('/classes/{class}/tests/{test}/scores', [TestController::class, 'classScores']);

    // Class Practices
    Route::get('/classes/{class}/practices', [ClassController::class, 'practices']);
    Route::post('/classes/{class}/practices', [ClassController::class, 'assignPractice']);
    Route::delete('/classes/{class}/practices/{practice}', [ClassController::class, 'removePractice']);

    // Users (Admin only)
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/teachers', [UserController::class, 'teachers']);
    Route::get('/users/students', [UserController::class, 'students']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Feedbacks (User: gửi và xem phản hồi của mình)
    Route::post('/feedbacks', [FeedbackController::class, 'store']);
    Route::get('/feedbacks/mine', [FeedbackController::class, 'mine']);

    // Feedbacks (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/feedbacks', [FeedbackController::class, 'index']);
        Route::post('/admin/feedbacks/{id}/reply', [FeedbackController::class, 'reply']);
        Route::patch('/admin/feedbacks/{id}/status', [FeedbackController::class, 'updateStatus']);
    });
});

// Broadcasting auth với JWT token (HttpOnly Cookie hoặc Bearer Header)
Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
})->middleware('jwt.auth');
