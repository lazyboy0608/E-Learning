<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
Broadcast::channel(
    'notifications.{userId}',
    function ($user, $userId) {
        return (int)$user->id === (int)$userId;
    }
);

Broadcast::channel('classes.{classId}', function ($user, $classId) {
    if ($user->role === 'admin') {
        return true;
    }

    $class = \App\Models\ClassModel::find($classId);
    if (!$class) {
        return false;
    }

    if ($class->created_by === $user->id) {
        return true;
    }

    return \App\Models\ClassUser::where('class_id', $classId)
        ->where('user_id', $user->id)
        ->exists();
});