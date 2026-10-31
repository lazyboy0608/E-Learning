<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_materials', function (Blueprint $table) {
            $table->unsignedBigInteger('file_size')->nullable()->after('type');
            $table->string('original_name')->nullable()->after('file_size');
        });
    }

    public function down(): void
    {
        Schema::table('class_materials', function (Blueprint $table) {
            $table->dropColumn(['file_size', 'original_name']);
        });
    }
};

