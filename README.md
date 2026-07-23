# Hướng dẫn chạy project

## 1. Backend

Terminal 1: Chạy server backend:

```bash
cd backend
php artisan serve
```

Terminal 2: Chạy WebSocket để nhận thông báo realtime:
```bash
cd backend
php artisan reverb:start
```

## 2. Frontend

Terminal 3: Chạy Frontend
```bash
cd frontend
npm run dev
```