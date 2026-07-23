<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_url');
            $table->enum('type', ['pdf', 'video', 'link', 'document'])->default('document');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_materials');
    }
};
