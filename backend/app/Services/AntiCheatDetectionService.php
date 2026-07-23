<?php

namespace App\Services;

use App\Models\TestAttempt;
use Illuminate\Support\Facades\DB;

class AntiCheatDetectionService
{
    const RISK_THRESHOLD = 70; // Risk score threshold (0-100)

    /**
     * Log suspicious activity
     */
    public function logActivity($attemptId, $activityType, $details = [])
    {
        return DB::table('event_logs')->insert([
            'test_attempt_id' => $attemptId,
            'activity_type' => $activityType,
            'details' => json_encode($details),
            'created_at' => now(),
        ]);
    }

    /**
     * Detect tab switch
     */
    public function detectTabSwitch($attemptId)
    {
        $this->logActivity($attemptId, 'tab_switch', [
            'message' => 'Student switched to another tab',
        ]);

        return true;
    }

    /**
     * Detect copy attempt
     */
    public function detectCopyAttempt($attemptId, $content = '')
    {
        $this->logActivity($attemptId, 'copy_attempt', [
            'message' => 'Possible copy/paste attempt detected',
            'content_length' => strlen($content),
        ]);

        return true;
    }

    /**
     * Detect suspicious answering pattern
     * E.g., all A's, all same pattern
     */
    public function detectSuspiciousPattern($attemptId)
    {
        $answers = DB::table('test_answers')
            ->where('test_attempt_id', $attemptId)
            ->pluck('student_answer')
            ->toArray();

        if (count($answers) < 5) {
            return false; // Need at least 5 answers to detect pattern
        }

        // Check if all answers are the same
        $unique = count(array_unique($answers));
        
        if ($unique === 1) {
            $this->logActivity($attemptId, 'suspicious_pattern', [
                'pattern' => 'All answers identical',
                'answer' => $answers[0],
            ]);
            return true;
        }

        // Check if answers follow repeating pattern (e.g., ABABAB)
        $pattern = implode('', $answers);
        if (preg_match('/(.{1,3})\1{2,}/', $pattern)) {
            $this->logActivity($attemptId, 'suspicious_pattern', [
                'pattern' => 'Repeating answer pattern detected',
            ]);
            return true;
        }

        return false;
    }

    /**
     * Detect unusually fast answers
     * If student answers too quickly, might indicate guessing or looking up
     */
    public function detectFastAnswering($attemptId)
    {
        $attempt = TestAttempt::find($attemptId);
        
        if (!$attempt || !$attempt->submitted_at) {
            return false;
        }

        $answerCount = DB::table('test_answers')
            ->where('test_attempt_id', $attemptId)
            ->count();

        $duration = $attempt->submitted_at->diffInSeconds($attempt->created_at);
        $avgTimePerQuestion = $duration / max($answerCount, 1);

        // If average time < 10 seconds per question, might be suspicious
        if ($avgTimePerQuestion < 10) {
            $this->logActivity($attemptId, 'fast_answering', [
                'avg_time_per_question' => $avgTimePerQuestion,
                'total_duration' => $duration,
            ]);
            return true;
        }

        return false;
    }

    /**
     * Detect unusual IP changes during test
     */
    public function detectIPChange($attemptId, $currentIP, $previousIP)
    {
        if ($currentIP !== $previousIP) {
            $this->logActivity($attemptId, 'ip_change', [
                'previous_ip' => $previousIP,
                'current_ip' => $currentIP,
            ]);
            return true;
        }

        return false;
    }

    /**
     * Calculate overall risk score
     */
    public function calculateRiskScore($attemptId)
    {
        $logs = DB::table('event_logs')
            ->where('test_attempt_id', $attemptId)
            ->get();

        $riskScore = 0;

        foreach ($logs as $log) {
            switch ($log->activity_type) {
                case 'tab_switch':
                    $riskScore += 15;
                    break;
                case 'copy_attempt':
                    $riskScore += 25;
                    break;
                case 'suspicious_pattern':
                    $riskScore += 20;
                    break;
                case 'fast_answering':
                    $riskScore += 10;
                    break;
                case 'ip_change':
                    $riskScore += 15;
                    break;
            }
        }

        return min($riskScore, 100); // Cap at 100
    }

    /**
     * Flag attempt for review if suspicious
     */
    public function analyzeAndFlag($attemptId)
    {
        $riskScore = $this->calculateRiskScore($attemptId);

        if ($riskScore >= self::RISK_THRESHOLD) {
            TestAttempt::where('id', $attemptId)->update([
                'flagged_for_review' => true,
                'risk_score' => $riskScore,
            ]);

            return [
                'flagged' => true,
                'reason' => 'High risk of cheating detected',
                'risk_score' => $riskScore,
            ];
        }

        TestAttempt::where('id', $attemptId)->update([
            'risk_score' => $riskScore,
        ]);

        return [
            'flagged' => false,
            'risk_score' => $riskScore,
        ];
    }

    /**
     * Get flagged attempts for teacher review
     */
    public function getFlaggedAttempts($teacherId, $limit = 20)
    {
        return DB::table('test_attempts')
            ->join('tests', 'test_attempts.test_id', '=', 'tests.id')
            ->where('tests.teacher_id', $teacherId)
            ->where('test_attempts.flagged_for_review', true)
            ->select(
                'test_attempts.id',
                'test_attempts.user_id',
                'test_attempts.test_id',
                'test_attempts.risk_score',
                'test_attempts.created_at',
                'tests.name as test_name'
            )
            ->orderByDesc('test_attempts.risk_score')
            ->limit($limit)
            ->get();
    }

    /**
     * Get activity log for an attempt
     */
    public function getActivityLog($attemptId)
    {
        return DB::table('event_logs')
            ->where('test_attempt_id', $attemptId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Disable copy functionality on frontend
     * (Returns JS code to be embedded)
     */
    public function getAntiCopyJS()
    {
        return <<<'JS'
        <script>
        document.addEventListener('copy', function(e) {
            e.preventDefault();
            alert('Copy is disabled during tests');
        });
        
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        </script>
        JS;
    }
}
