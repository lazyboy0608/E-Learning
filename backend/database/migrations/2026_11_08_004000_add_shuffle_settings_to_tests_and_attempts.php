<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            if (!Schema::hasColumn('tests', 'shuffle_questions')) {
                $table->boolean('shuffle_questions')->default(false)->after('duration');
            }
            if (!Schema::hasColumn('tests', 'shuffle_options')) {
                $table->boolean('shuffle_options')->default(false)->after('shuffle_questions');
            }
        });

        Schema::table('test_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('test_attempts', 'question_order')) {
                $table->json('question_order')->nullable()->after('total_points');
            }
            if (!Schema::hasColumn('test_attempts', 'option_orders')) {
                $table->json('option_orders')->nullable()->after('question_order');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $drop = [];
            if (Schema::hasColumn('tests', 'shuffle_questions')) {
                $drop[] = 'shuffle_questions';
            }
            if (Schema::hasColumn('tests', 'shuffle_options')) {
                $drop[] = 'shuffle_options';
            }
            if (!empty($drop)) {
                $table->dropColumn($drop);
            }
        });

        Schema::table('test_attempts', function (Blueprint $table) {
            $drop = [];
            if (Schema::hasColumn('test_attempts', 'question_order')) {
                $drop[] = 'question_order';
            }
            if (Schema::hasColumn('test_attempts', 'option_orders')) {
                $drop[] = 'option_orders';
            }
            if (!empty($drop)) {
                $table->dropColumn($drop);
            }
        });
    }
};

