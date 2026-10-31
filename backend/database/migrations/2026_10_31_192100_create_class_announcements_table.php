<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 50)->default('custom'); // material, test, practice, student_joined, custom
            $table->string('title');
            $table->text('content');
            $table->json('data')->nullable();
            $table->timestamps();

            $table->index(['class_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_announcements');
    }
};

