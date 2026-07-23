import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;
let echoToken = null; // Lưu token đã dùng để tạo instance hiện tại

export function getEcho() {
  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token');

  if (!token) {
    return null;
  }

  // Nếu token thay đổi (user khác đăng nhập), huỷ instance cũ
  // Tránh dùng token của user cũ đã bị revoke sau khi logout
  if (echoInstance && echoToken !== token) {
    echoInstance.disconnect();
    echoInstance = null;
    echoToken = null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  echoToken = token;

  echoInstance = new Echo({
    broadcaster: 'reverb',

    key: 'local',

    wsHost: '127.0.0.1',
    wsPort: 8080,

    forceTLS: false,
    enabledTransports: ['ws'],

    authEndpoint: 'http://localhost:8000/api/broadcasting/auth',

    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    }
  });

  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    echoToken = null; // Reset token tracking
  }
}