<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->enum('type', ['mcq', 'fill_blank', 'matching', 'table_fill']);
            $table->text('content');
            $table->string('media_image')->nullable();
            $table->string('media_audio')->nullable();
            $table->json('data'); // JSON chứa cấu trúc câu hỏi và đáp án
            $table->text('explanation')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
