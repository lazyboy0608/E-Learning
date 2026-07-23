<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('xp')->default(0)->after('role');
            $table->unsignedInteger('level')->default(1)->after('xp');
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('badge_code');
            $table->string('badge_name');
            $table->timestamps();

            $table->index(['user_id', 'badge_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_achievements');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['xp', 'level']);
        });
    }
};
