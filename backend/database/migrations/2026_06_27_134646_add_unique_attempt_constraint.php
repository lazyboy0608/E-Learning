<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('test_attempts', function (Blueprint $table) {

            $table->unique(

                [

                    'user_id',

                    'test_id',

                    'attempt_no'

                ],

                'attempt_unique'

            );

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('test_attempts', function (Blueprint $table) {

            $table->dropUnique('attempt_unique');

        });
    }
};
