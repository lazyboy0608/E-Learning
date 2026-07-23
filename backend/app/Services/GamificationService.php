<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class GamificationService
{
    const XP_PER_CORRECT = 10;
    const XP_PER_PERFECT_DAY = 100;
    const XP_PER_STREAK = 5;

    // Level thresholds
    const LEVEL_THRESHOLDS = [
        1 => 0,
        2 => 100,
        3 => 250,
        4 => 500,
        5 => 1000,
    ];

    /**
     * Add XP when student answers correctly
     */
    public function addXP($userId, $xpPoints = self::XP_PER_CORRECT)
    {
        $user = User::find($userId);
        
        if (!$user) {
            return false;
        }

        $user->xp = ($user->xp ?? 0) + $xpPoints;
        
        // Check for level up
        $newLevel = $this->calculateLevel($user->xp);
        if ($newLevel > ($user->level ?? 1)) {
            $user->level = $newLevel;
        }

        $user->save();

        return [
            'xp' => $user->xp,
            'level' => $user->level,
            'level_up' => $newLevel > ($user->level ?? 1),
        ];
    }

    /**
     * Calculate level based on XP
     */
    public function calculateLevel($xp)
    {
        $level = 1;
        
        foreach (self::LEVEL_THRESHOLDS as $lvl => $threshold) {
            if ($xp >= $threshold) {
                $level = $lvl;
            }
        }

        return $level;
    }

    /**
     * Check and award badges
     */
    public function checkAndAwardBadges($userId, $questionAnswered)
    {
        $user = User::find($userId);
        $badges = [];

        // Badge 1: First 10 Correct
        $correctCount = DB::table('question_progress')
            ->where('user_id', $userId)
            ->where('is_correct', 1)
            ->count();

        if ($correctCount == 10) {
            $badges[] = $this->awardBadge($userId, 'first_10_correct', 'First 10 Correct!');
        }

        // Badge 2: 100 Correct Answers
        if ($correctCount == 100) {
            $badges[] = $this->awardBadge($userId, 'hundred_correct', 'Century Achievement');
        }

        // Badge 3: Perfect Day (all answers correct in a day)
        $todayCorrect = DB::table('question_progress')
            ->where('user_id', $userId)
            ->whereDate('created_at', today())
            ->where('is_correct', 1)
            ->count();

        $todayTotal = DB::table('question_progress')
            ->where('user_id', $userId)
            ->whereDate('created_at', today())
            ->count();

        if ($todayTotal > 0 && $todayCorrect == $todayTotal && $todayTotal >= 5) {
            $badges[] = $this->awardBadge($userId, 'perfect_day', 'Perfect Day!');
        }

        // Badge 4: Streak (10 correct in a row)
        $streak = $this->calculateCurrentStreak($userId);
        if ($streak >= 10) {
            $badges[] = $this->awardBadge($userId, 'streak_10', '10x Streak Master');
        }

        return $badges;
    }

    /**
     * Award badge to user
     */
    private function awardBadge($userId, $badgeCode, $badgeName)
    {
        // Check if already awarded
        $exists = DB::table('user_achievements')
            ->where('user_id', $userId)
            ->where('badge_code', $badgeCode)
            ->exists();

        if (!$exists) {
            DB::table('user_achievements')->insert([
                'user_id' => $userId,
                'badge_code' => $badgeCode,
                'badge_name' => $badgeName,
                'created_at' => now(),
            ]);

            return [
                'code' => $badgeCode,
                'name' => $badgeName,
                'awarded' => true,
            ];
        }

        return null;
    }

    /**
     * Calculate current streak (consecutive correct answers)
     */
    public function calculateCurrentStreak($userId)
    {
        $recentProgress = DB::table('question_progress')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(100)
            ->get();

        $streak = 0;
        
        foreach ($recentProgress as $progress) {
            if ($progress->is_correct) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }

    /**
     * Get user gamification stats
     */
    public function getUserStats($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return null;
        }

        $correctCount = DB::table('question_progress')
            ->where('user_id', $userId)
            ->where('is_correct', 1)
            ->count();

        $totalCount = DB::table('question_progress')
            ->where('user_id', $userId)
            ->count();

        $achievements = DB::table('user_achievements')
            ->where('user_id', $userId)
            ->get();

        return [
            'xp' => $user->xp ?? 0,
            'level' => $user->level ?? 1,
            'correct_answers' => $correctCount,
            'total_answers' => $totalCount,
            'success_rate' => $totalCount > 0 ? round(($correctCount / $totalCount) * 100, 2) : 0,
            'current_streak' => $this->calculateCurrentStreak($userId),
            'badges' => $achievements,
        ];
    }
}
