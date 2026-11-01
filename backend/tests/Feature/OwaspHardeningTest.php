<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\TestQuestion;
use App\Models\User;
use App\Services\AuthService;
use App\Services\JwtService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwaspHardeningTest extends TestCase
{
    use RefreshDatabase;

    private JwtService $jwtService;
    private User $teacher;
    private User $studentA;
    private User $studentB;
    private User $admin;
    private Subject $subject;
    private Test $test;
    private Question $question;
    private TestAttempt $attemptA;

    protected function setUp(): void
    {
        parent::setUp();
        $this->jwtService = app(JwtService::class);

        // 1. Tạo Users với các vai trò khác nhau
        $this->teacher = User::create([
            'name' => 'Teacher One',
            'email' => 'teacher_' . uniqid() . '@smartedu.vn',
            'password' => bcrypt('password123'),
            'role' => 'teacher',
        ]);

        $this->studentA = User::create([
            'name' => 'Student A (Owner)',
            'email' => 'student_a_' . uniqid() . '@smartedu.vn',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $this->studentB = User::create([
            'name' => 'Student B (Attacker)',
            'email' => 'student_b_' . uniqid() . '@smartedu.vn',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $this->admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin_' . uniqid() . '@smartedu.vn',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        // 2. Tạo môn học và bài test
        $this->subject = Subject::create([
            'name' => 'Toán Học 10',
            'class_level' => 'Grade 10',
        ]);

        $this->test = Test::create([
            'title' => 'Kiểm tra Giải Tích 10',
            'subject_id' => $this->subject->id,
            'created_by' => $this->teacher->id,
            'test_code' => 'MATH_' . strtoupper(uniqid()),
            'access_type' => 'public_code',
            'duration' => 45,
            'is_active' => true,
        ]);

        // 3. Tạo câu hỏi cho bài test
        $this->question = Question::create([
            'subject_id' => $this->subject->id,
            'created_by' => $this->teacher->id,
            'content' => '1 + 1 = ?',
            'type' => 'mcq',
            'data' => [
                'options' => ['A' => '1', 'B' => '2', 'C' => '3', 'D' => '4'],
                'correct_answers' => ['B'],
            ],
            'is_active' => true,
        ]);

        TestQuestion::create([
            'test_id' => $this->test->id,
            'question_id' => $this->question->id,
            'score' => 10,
            'order' => 1,
        ]);

        // 4. Tạo lượt làm bài cho Student A (in_progress)
        $this->attemptA = TestAttempt::create([
            'user_id' => $this->studentA->id,
            'test_id' => $this->test->id,
            'attempt_no' => 1,
            'started_at' => now(),
            'status' => TestAttempt::STATUS_IN_PROGRESS,
            'score' => 0.00,
            'tab_switch_count' => 0,
        ]);
    }

    private function authHeaders(User $user): array
    {
        $token = $this->jwtService->generateAccessToken($user);
        return [
            'Authorization' => "Bearer {$token}",
            'Accept' => 'application/json',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | PHẦN 1: BẢO VỆ ĐĂNG KÝ ADMIN TRÁI PHÉP (OWASP API5 - BFLA)
    |--------------------------------------------------------------------------
    */

    public function test_cannot_register_as_admin_via_public_api(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Hacker Admin',
            'email' => 'hacker_admin_' . uniqid() . '@badactor.com',
            'password' => 'HackerPass123!',
            'password_confirmation' => 'HackerPass123!',
            'role' => 'admin',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role']);
    }

    public function test_can_register_as_student(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Valid Student',
            'email' => 'student_valid_' . uniqid() . '@smartedu.vn',
            'phone' => '0912345678',
            'password' => 'ValidPass123!',
            'password_confirmation' => 'ValidPass123!',
            'role' => 'student',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'name' => 'Valid Student',
            'role' => 'student',
        ]);
    }

    public function test_can_register_as_teacher(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Valid Teacher',
            'email' => 'teacher_valid_' . uniqid() . '@smartedu.vn',
            'phone' => '0987654321',
            'password' => 'ValidPass123!',
            'password_confirmation' => 'ValidPass123!',
            'role' => 'teacher',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'name' => 'Valid Teacher',
            'role' => 'teacher',
        ]);
    }

    public function test_auth_service_blocks_admin_registration_directly(): void
    {
        $authService = app(AuthService::class);
        $result = $authService->register([
            'name' => 'Direct Hacker',
            'email' => 'direct_hacker_' . uniqid() . '@test.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $this->assertFalse($result['success']);
        $this->assertEquals(403, $result['status']);
    }

    /*
    |--------------------------------------------------------------------------
    | PHẦN 2: CHỐNG BOLA / IDOR TRÊN TEST ATTEMPTS (OWASP API1)
    |--------------------------------------------------------------------------
    */

    public function test_student_b_cannot_view_student_a_attempt_results(): void
    {
        // Student B cố tình truy cập kết quả của Student A
        $response = $this->withHeaders($this->authHeaders($this->studentB))
            ->getJson("/api/tests/attempts/{$this->attemptA->id}");

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Bạn không có quyền xem kết quả của lượt làm bài này.',
        ]);
    }

    public function test_student_a_can_view_own_attempt_results(): void
    {
        // Đổi attempt sang completed để getResults có dữ liệu đầy đủ
        $this->attemptA->update([
            'status' => TestAttempt::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'score' => 100,
        ]);

        $response = $this->withHeaders($this->authHeaders($this->studentA))
            ->getJson("/api/tests/attempts/{$this->attemptA->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_teacher_creator_can_view_student_attempt_results(): void
    {
        $this->attemptA->update([
            'status' => TestAttempt::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'score' => 100,
        ]);

        $response = $this->withHeaders($this->authHeaders($this->teacher))
            ->getJson("/api/tests/attempts/{$this->attemptA->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_admin_can_view_student_attempt_results(): void
    {
        $this->attemptA->update([
            'status' => TestAttempt::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'score' => 100,
        ]);

        $response = $this->withHeaders($this->authHeaders($this->admin))
            ->getJson("/api/tests/attempts/{$this->attemptA->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_student_b_cannot_review_student_a_attempt(): void
    {
        // Student B cố tình truy cập review bài làm của Student A
        $response = $this->withHeaders($this->authHeaders($this->studentB))
            ->getJson("/api/tests/attempts/{$this->attemptA->id}/review");

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Bạn không có quyền xem chi tiết bài làm này.',
        ]);
    }

    public function test_student_a_can_review_own_attempt(): void
    {
        $this->attemptA->update([
            'status' => TestAttempt::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'score' => 100,
        ]);

        $response = $this->withHeaders($this->authHeaders($this->studentA))
            ->getJson("/api/tests/attempts/{$this->attemptA->id}/review");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_student_b_cannot_save_answer_for_student_a_attempt(): void
    {
        // Student B cố gửi đáp án sửa bài thi đang làm của Student A
        $response = $this->withHeaders($this->authHeaders($this->studentB))
            ->postJson('/api/tests/save-answer', [
                'attempt_id' => $this->attemptA->id,
                'question_id' => $this->question->id,
                'answer' => 'C',
            ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Bạn không có quyền cập nhật đáp án cho lượt làm bài này.',
        ]);
    }

    public function test_student_a_can_save_answer_for_own_attempt(): void
    {
        $response = $this->withHeaders($this->authHeaders($this->studentA))
            ->postJson('/api/tests/save-answer', [
                'attempt_id' => $this->attemptA->id,
                'question_id' => $this->question->id,
                'answer' => 'B',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_student_b_cannot_submit_student_a_attempt(): void
    {
        // Student B cố tình submit kết thúc bài thi của Student A
        $response = $this->withHeaders($this->authHeaders($this->studentB))
            ->postJson("/api/tests/{$this->test->id}/submit", [
                'attempt_id' => $this->attemptA->id,
                'answers' => [
                    [
                        'question_id' => $this->question->id,
                        'answer' => 'B',
                    ],
                ],
            ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Bạn không có quyền nộp bài cho lượt làm bài này.',
        ]);
    }

    public function test_student_a_can_submit_own_attempt(): void
    {
        $response = $this->withHeaders($this->authHeaders($this->studentA))
            ->postJson("/api/tests/{$this->test->id}/submit", [
                'attempt_id' => $this->attemptA->id,
                'answers' => [
                    [
                        'question_id' => $this->question->id,
                        'answer' => 'B',
                    ],
                ],
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $this->assertEquals(TestAttempt::STATUS_SUBMITTED, $this->attemptA->fresh()->status);
    }

    public function test_student_b_cannot_trigger_tab_switch_for_student_a_attempt(): void
    {
        // Student B cố tình gửi tab switch giả mạo cho lượt thi của Student A
        $response = $this->withHeaders($this->authHeaders($this->studentB))
            ->postJson("/api/tests/attempts/{$this->attemptA->id}/tab-switch");

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Bạn không có quyền thao tác trên lượt làm bài này.',
        ]);
    }

    public function test_student_a_can_trigger_tab_switch_for_own_attempt(): void
    {
        $response = $this->withHeaders($this->authHeaders($this->studentA))
            ->postJson("/api/tests/attempts/{$this->attemptA->id}/tab-switch");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'tab_switch_count' => 1,
            ],
        ]);
        $this->assertEquals(1, $this->attemptA->fresh()->tab_switch_count);
    }
}
