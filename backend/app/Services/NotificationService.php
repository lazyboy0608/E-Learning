<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function sendToUser(int $userId, string $title, string $message, string $type = 'info'): array
    {
        $user = User::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
            ];
        }

        $this->sendNotification($user, $title, $message, $type);

        return [
            'success' => true,
            'message' => 'Notification sent',
        ];
    }

    public function sendToUsers(array $userIds, string $title, string $message, string $type = 'info'): array
    {
        $users = User::whereIn('id', $userIds)->get();

        if ($users->isEmpty()) {
            return [
                'success' => false,
                'message' => 'No users found',
            ];
        }

        foreach ($users as $user) {
            $this->sendNotification($user, $title, $message, $type);
        }

        return [
            'success' => true,
            'message' => 'Notifications sent to ' . $users->count() . ' users',
        ];
    }

    public function sendToRole(string $role, string $title, string $message, string $type = 'info'): array
    {
        $users = User::where('role', $role)->get();

        if ($users->isEmpty()) {
            return [
                'success' => false,
                'message' => 'No users found with role: ' . $role,
            ];
        }

        foreach ($users as $user) {
            $this->sendNotification($user, $title, $message, $type);
        }

        return [
            'success' => true,
            'message' => 'Notifications sent to ' . $users->count() . ' ' . $role . 's',
        ];
    }

    public function sendTestResultNotification(int $userId, string $testName, float $score): array
    {
        $user = User::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
            ];
        }

        $title = 'Ket qua bai kiem tra';
        $message = "Ban da dat {$score} diem trong bai kiem tra '{$testName}'";

        $this->sendNotification($user, $title, $message, 'result');

        return [
            'success' => true,
            'message' => 'Test result notification sent',
        ];
    }

    public function sendClassInvitation(int $userId, string $className): array
    {
        $user = User::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
            ];
        }

        $title = 'Loi moi tham gia lop hoc';
        $message = "Ban duoc moi tham gia lop '{$className}'";

        $this->sendNotification($user, $title, $message, 'invitation');

        return [
            'success' => true,
            'message' => 'Class invitation sent',
        ];
    }

    public function sendReminder(int $userId, string $reminderText): array
    {
        $user = User::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
            ];
        }

        $this->sendNotification($user, 'Nhac nho', $reminderText, 'reminder');

        return [
            'success' => true,
            'message' => 'Reminder sent',
        ];
    }

    private function sendNotification(User $user, string $title, string $message, string $type): void
    {
        try {
            Log::info('Notification sent', [
                'user_id' => $user->id,
                'title' => $title,
                'type' => $type,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
