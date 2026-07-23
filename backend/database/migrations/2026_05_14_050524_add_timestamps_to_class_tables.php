<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_users', function (Blueprint $table) {
            $table->timestamps();
        });

        Schema::table('class_tests', function (Blueprint $table) {
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('class_users', function (Blueprint $table) {
            $table->dropTimestamps();
        });

        Schema::table('class_tests', function (Blueprint $table) {
            $table->dropTimestamps();
        });
    }
};
