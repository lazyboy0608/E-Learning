<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('test_answers', function (Blueprint $table) {
            if (!Schema::hasColumn('test_answers', 'question_snapshot')) {
                $table->json('question_snapshot')->nullable()->after('score');
            }
        });

        Schema::table('test_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('test_attempts', 'earned_points')) {
                $table->decimal('earned_points', 8, 2)->nullable()->after('score');
            }
            if (!Schema::hasColumn('test_attempts', 'total_points')) {
                $table->decimal('total_points', 8, 2)->nullable()->after('earned_points');
            }
        });
    }

    public function down(): void
    {
        Schema::table('test_answers', function (Blueprint $table) {
            if (Schema::hasColumn('test_answers', 'question_snapshot')) {
                $table->dropColumn('question_snapshot');
            }
        });

        Schema::table('test_attempts', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('test_attempts', 'earned_points')) {
                $columnsToDrop[] = 'earned_points';
            }
            if (Schema::hasColumn('test_attempts', 'total_points')) {
                $columnsToDrop[] = 'total_points';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};

