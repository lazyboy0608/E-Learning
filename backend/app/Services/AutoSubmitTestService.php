<?php

namespace App\Services;

use App\Models\TestAttempt;
use App\Models\TestAnswer;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AutoSubmitTestService
{
    /**
     * Check and auto-submit expired tests
     * Run this as a scheduled job (every minute or 5 minutes)
     */
    public function checkAndAutoSubmitExpired()
    {
        $expiredAttempts = TestAttempt::where('status', 'in_progress')
            ->where('expired_at', '<', now())
            ->get();

        $submitted = [];

        foreach ($expiredAttempts as $attempt) {
            $result = $this->autoSubmitAttempt($attempt->id);
            $submitted[] = $result;
        }

        return [
            'total_auto_submitted' => count($submitted),
            'details' => $submitted,
        ];
    }

    /**
     * Auto submit a single test attempt
     */
    public function autoSubmitAttempt($attemptId)
    {
        $attempt = TestAttempt::find($attemptId);

        if (!$attempt || $attempt->status !== 'in_progress') {
            return [
                'attempt_id' => $attemptId,
                'status' => 'failed',
                'reason' => 'Attempt not found or already submitted',
            ];
        }

        // Check if time is expired
        if ($attempt->expired_at > now()) {
            return [
                'attempt_id' => $attemptId,
                'status' => 'failed',
                'reason' => 'Test time not expired yet',
            ];
        }

        // Get all answers submitted so far
        $answers = TestAnswer::where('test_attempt_id', $attemptId)->get();

        // Calculate score
        $score = $this->calculateScore($answers);

        // Update attempt status
        $attempt->update([
            'status' => 'completed',
            'score' => $score,
            'submitted_at' => now(),
            'auto_submitted' => true,
        ]);

        return [
            'attempt_id' => $attemptId,
            'status' => 'success',
            'score' => $score,
            'reason' => 'Auto submitted due to time expiration',
        ];
    }

    /**
     * Calculate score from answers
     */
    private function calculateScore($answers)
    {
        $totalQuestions = $answers->count();
        
        if ($totalQuestions === 0) {
            return 0;
        }

        $correctCount = $answers->where('is_correct', 1)->count();

        return round(($correctCount / $totalQuestions) * 100, 2);
    }

    /**
     * Get time remaining for a test
     */
    public function getTimeRemaining($attemptId)
    {
        $attempt = TestAttempt::find($attemptId);

        if (!$attempt) {
            return null;
        }

        $now = Carbon::now();
        $expiredAt = Carbon::parse($attempt->expired_at);

        if ($now >= $expiredAt) {
            return [
                'remaining' => 0,
                'expired' => true,
                'message' => 'Test time has expired',
            ];
        }

        $secondsRemaining = $expiredAt->diffInSeconds($now);

        return [
            'remaining' => $secondsRemaining,
            'expired' => false,
            'formatted' => $this->formatSeconds($secondsRemaining),
        ];
    }

    /**
     * Format seconds to HH:MM:SS
     */
    private function formatSeconds($seconds)
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;

        return sprintf('%02d:%02d:%02d', $hours, $minutes, $secs);
    }
}
