<?php

use Illuminate\Support\Facades\Route;

Route::get('/broadcast-test', function () {

    broadcast(
        new \App\Events\NotificationCreated(2)
    );

    return 'ok';
});