<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')->constrained('tests')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->unsignedInteger('order_index')->nullable();
            $table->decimal('score', 5, 2)->nullable(); // Điểm của câu hỏi
            
            $table->unique(['test_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_questions');
    }
};
