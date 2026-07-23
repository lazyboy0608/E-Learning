# Yêu cầu hệ thống
- Máy tính sử dụng hệ điều hành Windows 10/11, Linux, MacOS
- Đã cài đặt PHP phiên bản 8.2 trở lên
- Đã cài đặt Composer
- Đã cài đặt Node.js phiên bản 18 trở lên
- Đã cài đặt MySQL phiên bản 8.0 trở lên
- Đã cài đặt XAMPP (hoặc Laragon)
- Trình duyệt Web (Microsoft Edge, Google Chrome...)
- Đã cài đặt Git để quản lý và tải mã nguồn dự án

# Các bước cài đặt chương trình
1. Clone dự án
git clone <repository_url>
cd E-Learning

______________________________

2. Cài đặt Backend (Laravel)
```text
Di chuyển vào thư mục Backend:
cd backend
Cài đặt các thư viện cần thiết:
composer install
Sao chép file cấu hình môi trường:
cp .env.example .env
Tạo khóa ứng dụng:
php artisan key:generate
```
Cấu hình kết nối CSDL trong .env
```text
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smartedu
DB_USERNAME=root
DB_PASSWORD=
```

______________________________
3. Cài đặt Database
```text
Tạo cơ sở dữ liệu:
CREATE DATABASE smartedu;
Thực hiện migration tạo bảng dữ liệu:
php artisan migrate
Nếu dự án có dữ liệu mẫu:
php artisan db:seed
```

_______________________________
4. Hướng dẫn chạy project

## 4.1. Backend

Terminal 1: Chạy server backend:

```bash
cd backend
php artisan serve
```
```text
Backend sẽ chạy tại: http://localhost:8000
```

Terminal 2: Chạy WebSocket để nhận thông báo realtime:
```bash
cd backend
php artisan reverb:start
```

## 4.2. Frontend

Terminal 3: Chạy Frontend
```bash
cd frontend
npm run dev
```
```text
Frontend sẽ chạy tại: http://localhost:5173
```

____________________________________
5. Tài khoản đăng nhập thử nghiệm
Sau khi chạy Seeder, hệ thống sẽ cung cấp một số tài khoản mẫu:
```text
Vai trò    Email              Mật khẩu
Admin      admin@school.edu   password
Teacher    teacher@school.edu password
Student    student@school.edu password
```
(Thông tin tài khoản thực tế phụ thuộc vào dữ liệu seed của dự án)

____________________________________
API documentation
```text
Các API của hệ thống có thể được kiểm thử thông qua:
http://localhost:8000/api
Nếu dự án tích hợp Swagger:
http://localhost:8000/api/documentation
```