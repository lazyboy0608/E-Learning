<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $duplicates = DB::table('subjects')
            ->select('name')
            ->groupBy('name')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            $toKeep = DB::table('subjects')
                ->where('name', $duplicate->name)
                ->orderBy('id')
                ->first();

            DB::table('subjects')
                ->where('name', $duplicate->name)
                ->where('id', '>', $toKeep->id)
                ->delete();
        }

        Schema::table('subjects', function (Blueprint $table) {
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
    }
};