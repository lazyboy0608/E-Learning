<?php

namespace App\Console\Commands;

use App\Models\TestAttempt;
use App\Services\TestService;
use Illuminate\Console\Command;

class RecalculateExpiredScores extends Command
{
    protected $signature = 'tests:recalc-expired';

    protected $description = 'Recalculate scores for expired test attempts';

    public function handle(TestService $testService): int
    {
        $attempts = TestAttempt::where('status', TestAttempt::STATUS_EXPIRED)->get();

        if ($attempts->isEmpty()) {
            $this->info('No expired attempts to recalculate.');
            return self::SUCCESS;
        }

        $this->info("Recalculating {$attempts->count()} expired attempt(s)...");

        foreach ($attempts as $attempt) {
            $testService->expireAttempt($attempt->id);
            $attempt->refresh();
            $this->line("  Attempt #{$attempt->id}: score = {$attempt->score}%");
        }

        $this->info('Done.');
        return self::SUCCESS;
    }
}
