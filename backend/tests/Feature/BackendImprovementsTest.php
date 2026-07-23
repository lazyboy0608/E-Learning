<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use App\Helpers\MediaCleanupHelper;
use Tests\TestCase;

class BackendImprovementsTest extends TestCase
{
    use RefreshDatabase;
    /**
     * Test that the test_answers table has the score column.
     */
    public function test_test_answers_has_score_column(): void
    {
        $this->assertTrue(Schema::hasColumn('test_answers', 'score'));
    }

    /**
     * Test that MediaCleanupHelper deletes local public storage files.
     */
    public function test_media_cleanup_helper_deletes_files(): void
    {
        Storage::fake('public');

        // Create a fake media file
        Storage::disk('public')->put('questions/test_image.png', 'fake content');

        // Verify the file exists
        $this->assertTrue(Storage::disk('public')->exists('questions/test_image.png'));

        // Delete using helper with full URL path
        MediaCleanupHelper::deleteLocalFile('http://localhost:8000/storage/questions/test_image.png');

        // Verify it was deleted
        $this->assertFalse(Storage::disk('public')->exists('questions/test_image.png'));
    }

    /**
     * Test tab switch count increments.
     */
    public function test_tab_switch_count_increment(): void
    {
        // Create user
        $user = \App\Models\User::create([
            'name' => 'Student Test',
            'email' => 'student_' . uniqid() . '@test.com',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);
        
        // Create subject
        $subject = \App\Models\Subject::create(['name' => 'Math', 'class_level' => 'Grade 10']);

        // Create test
        $test = \App\Models\Test::create([
            'title' => 'Math Test',
            'subject_id' => $subject->id,
            'created_by' => $user->id,
            'test_code' => 'MATH101',
            'access_type' => 'public_code',
            'is_active' => true,
        ]);

        // Create attempt
        $attempt = \App\Models\TestAttempt::create([
            'user_id' => $user->id,
            'test_id' => $test->id,
            'attempt_no' => 1,
            'started_at' => now(),
            'status' => \App\Models\TestAttempt::STATUS_IN_PROGRESS,
            'score' => 0.00,
            'tab_switch_count' => 0,
        ]);

        // Call the API authenticated
        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tests/attempts/{$attempt->id}/tab-switch");

        $response->assertStatus(200);
        $response->assertJsonPath('data.tab_switch_count', 1);

        // Verify database
        $this->assertDatabaseHas('test_attempts', [
            'id' => $attempt->id,
            'tab_switch_count' => 1,
        ]);
    }
}
