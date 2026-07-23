# HUONG DAN THUC HIEN DU AN
## He thong Web Day Hoc Cho Hoc Sinh Tieu Hoc

---

# 1. TINH TRANG HIEN TAI

## 1.1. Tong quan

| Thanh phan | Trang thai | Ghi chu |
|------------|------------|---------|
| Database | HOAN THIEN | Tat ca migrations da co |
| Auth Module | HOAN THIEN | Backend + Frontend |
| Question Module | GAN HOAN THIEN | 80% - con loi nho |
| Test Module | HOAN THIEN | Backend + Frontend |
| Class Module | HOAN THIEN | Backend + Frontend |
| User Module | HOAN THIEN | Backend + Frontend |
| Admin Pages | HOAN THIEN | Dashboard, Users, Quiz Management |

## 1.2. Backend da co

```
backend/app/
├── Http/Controllers/
│   ├── AuthController.php       [HOAN THIEN]
│   ├── QuestionController.php   [HOAN THIEN]
│   ├── PracticeController.php   [HOAN THIEN]
│   ├── TestController.php       [HOAN THIEN]
│   ├── ClassController.php      [HOAN THIEN]
│   └── UserController.php       [HOAN THIEN]
├── Services/                    [HOAN THIEN - Tat ca]
├── Repositories/                [HOAN THIEN - Tat ca]
├── Strategies/Scoring/
│   ├── McqStrategy.php          [HOAN THIEN]
│   ├── FillBlankStrategy.php    [HOAN THIEN]
│   ├── MatchingStrategy.php     [HOAN THIEN]
│   └── TableFillStrategy.php    [HOAN THIEN]
├── Models/                     [HOAN THIEN]
└── Middleware/RoleMiddleware.php [HOAN THIEN]
```

## 1.3. Frontend da co

```
frontend/src/
├── features/auth/               [HOAN THIEN - Login/Register]
├── features/admin/              [HOAN THIEN - Dashboard, Users, Quiz Management]
├── features/teacher/
│   ├── pages/QuestionListPage   [HOAN THIEN]
│   ├── pages/CreateQuestionPage [HOAN THIEN - MCQ, FillBlank]
│   ├── pages/TestListPage       [HOAN THIEN]
│   └── pages/ClassListPage      [HOAN THIEN]
├── features/student/
│   ├── pages/PracticeSession    [HOAN THIEN]
│   └── pages/TestSession        [HOAN THIEN]
└── components/
    ├── common/questions/        [HOAN THIEN - MCQ, FillBlank, Matching, TableFill]
    └── student/                 [HOAN THIEN]
```

---

# 2. CAC LOI CAN SUA

## 2.1. Question Module - Loi chinh

| STT | Loi | Doi tuong | Do uu tien |
|------|-----|-----------|-------------|
| 1 | Thieu truong `scope` (system/class) trong bang questions | Backend | CAO | Fixed |
| 2 | API routes khong co phan quyen cho Question | Backend | CAO | Fixed |
| 3 | Matching/TableFill form chua hoan thien | Frontend | TRUNG BINH | Fixed |
| 4 | Khong co trang Question cho Admin | Frontend | TRUNG BINH | Fixed |
| 5 | He thong chua luu duoc nhieu dap an dung la cau hoi dang mcq | Frontend / API | TRUNG BINH

## 2.2. Chi tiet loi

### Loi 1: Thieu truong scope

**Hien tai:**
```php
// questions table
$table->foreignId('created_by')->constrained('users');
// Khong co truong phan biet global vs class question
```

**Can them:**
```php
$table->enum('scope', ['system', 'class'])->default('class')->after('created_by');
```

### Loi 2: API routes khong phan quyen

**Hien tai:**
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/questions', [QuestionController::class, 'store']); // Moi nguoi deu tao duoc
});
```

**Can sua:**
```php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/questions/system', [QuestionController::class, 'storeSystemQuestion']);
});

Route::middleware(['auth:sanctum', 'role:teacher'])->group(function () {
    Route::post('/questions/class', [QuestionController::class, 'storeClassQuestion']);
});
```

### Loi 3: Matching/TableFill form chua hoan thien

**Hien tai:**
```jsx
{formData.type === 'matching' && (
  <div>Tinh nang dang duoc phat trien...</div>
)}
```

**Can hoan thien form nhap cho Matching va TableFill**

### Loi 5: Mo ta nhu sau:
### Câu hỏi có nhiều đáp án đúng, đã test API và dữ liệu đã ghi nhận các đáp án đúng
### Nhưng khi ấn sửa câu hỏi, trong đó ko hiện sẵn tất cả các đáp án đúng mà chỉ hiện 1 đáp án đúng (Bug)
### Check các phần renderMcqField, {correct_answers: qData.data?.correct_answers || (qData.data?.correct_answer ? [qData.data.correct_answer] : []),} trong /features/teacher/pages/EditQuestionPage.jsx
### Có thể AdminEditQuestionPage cũng bị lỗi tương tự, nếu sửa đc từ bên teacher thì áp dụng cho admin

---

# 3. PHAN CHIA CONG VIEC SUA LOI

## 3.1. Backend - Dev 1

### Nhiem vu: Them scope va phan quyen Question

| Cong viec | Mo ta | Trang Thai |
|-----------|-------|------------|
| Tao migration them truong scope | `scope` = system/class | Da thuc hien, Da test |
| Sua Question Model | Them scope vao fillable | Da thuc hien |
| Sua QuestionController | Tach endpoint theo scope | Da thuc hien |
| Tao middleware kiem tra quyen | Admin tao system, Teacher tao class | Da thuc hien |
| Cap nhat routes | Phan quyen theo role | Con thieu Practice |

### Chi tiet thuc hien

**Buoc 1: Tao migration**
```bash
php artisan make:migration add_scope_to_questions_table
```

**Buoc 2: Sua Model**
```php
// app/Models/Question.php
protected $fillable = [
    'subject_id',
    'type',
    'content',
    'media_image',
    'media_audio',
    'data',
    'explanation',
    'created_by',
    'scope', // Them vao
];
```

**Buoc 3: Cap nhat Routes**
```php
// routes/api.php

// System Questions (Admin only)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/questions', [QuestionController::class, 'indexSystem']);
    Route::post('/admin/questions', [QuestionController::class, 'storeSystem']);
    Route::put('/admin/questions/{id}', [QuestionController::class, 'updateSystem']);
    Route::delete('/admin/questions/{id}', [QuestionController::class, 'destroySystem']);
});

// Class Questions (Teacher + Admin)
Route::middleware(['auth:sanctum', 'role:teacher,admin'])->group(function () {
    Route::get('/teacher/questions', [QuestionController::class, 'indexClass']);
    Route::post('/teacher/questions', [QuestionController::class, 'storeClass']);
    Route::put('/teacher/questions/{id}', [QuestionController::class, 'updateClass']);
    Route::delete('/teacher/questions/{id}', [QuestionController::class, 'destroyClass']);
});

// Practice - All authenticated users
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/practice/questions/random', [PracticeController::class, 'getRandomQuestions']);
    Route::post('/practice/check', [PracticeController::class, 'checkAnswer']);
});
```

## 3.2. Frontend - Dev 2

### Nhiem vu: Hoan thien Question UI

| Cong viec | Mo ta | Trang Thai | Test? |
|-----------|-------|------------|-------|
| Hoan thien Matching form | Nhap cap doi, noi cot | Da thuc hien | Da Test |
| Hoan thien TableFill form | Nhap bang, dien o | Da thuc hien | Da Test |
| Tao trang Question cho Admin | Quan ly global questions | Da thuc hien | Da Test |
| Cap nhat routes | Admin vs Teacher question pages | Da thuc hien | Da Test |

### Chi tiet thuc hien

**Buoc 1: Hoan thien Matching form**
```jsx
// components/teacher/questions/MatchingBuilder.jsx
// Form nhap cap noi: A1 -> B2, A2 -> B1, ...
```

**Buoc 2: Hoan thien TableFill form**
```jsx
// components/teacher/questions/TableFillBuilder.jsx
// Form nhap bang: headers, rows, correct_answers
```

**Buoc 3: Tao Admin Question page**
```jsx
// features/admin/pages/QuestionManagementPage.jsx
// Hien thi tat ca questions (scope=system)
// Cho phep tao, sua, xoa questions
```

---

# 4. TEST SAU KHI SUA

## 4.1. Test Backend

```bash
# Login admin
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu","password":"password", "role":"admin"}'

# Đã test thành công

# Tao question (Admin - nen thanh cong)
curl -X POST http://localhost:8000/api/admin/questions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject_id":1,"type":"mcq","content":"Test?","scope":"system","data":{...}}'

# Đã test thành công

# Login teacher
# Tao question (Teacher - nen thanh cong)
curl -X POST http://localhost:8000/api/teacher/questions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject_id":1,"type":"mcq","content":"Test?","scope":"class","data":{...}}'

# Đã test thành công
```

## 4.2. Test Frontend

| Hanh dong | Ket qua mong muon | Test? |
|-----------|-------------------|-------|
| Admin dang nhap -> Question page | Thay danh sach global questions | Test Thanh Cong |
| Teacher dang nhap -> Tao question | Chon duoc MCQ, FillBlank, Matching, TableFill | Test Thanh Cong |
| Tao question Matching | Luu thanh cong, hien thi dung | Test Thanh Cong |
| Tao question TableFill | Luu thanh cong, hien thi dung | Test Thanh Cong |

---

# 5. CAC MODULE DA HOAN THIEN

Khong can lam gi them, chi can test:

| Module | Trang thai | Test Checklist |
|--------|------------|----------------|
| Auth | HOAN THIEN | Login, Register, Logout |
| Test | HOAN THIEN | Start, Submit, Results |
| Class | HOAN THIEN | Create, Join, Add student |
| User | HOAN THIEN | CRUD users |

---

# 6. BO SUNG TINH NANG (Optional)

Neu co them thoi gian:

| Tinh nang | Mo ta | Do uu tien |
|-----------|-------|------------|
| Question import (Excel) | Nhap nhieu cau hoi tu file | THAP |
| Random test generator | Tao test tu question bank | THAP |
| Dashboard thong ke | Bieu do ket qua hoc tap | THAP |

---

# 7. QUY TAC

1. **DB changes:** Bao truoc khi thay doi
2. **Code:** Dung Service/Repository pattern
3. **Git:** Branch moi cho moi feature
4. **Test:** Test truoc khi commit

---

# 8. TAI LIEU THIET KE

| File | Mo ta |
|------|-------|
| DATABASE SCHEMA.md | Cau truc database |
| BACKEND OVERVIEW.md | Kien truc backend |
| hethong_final.md | Mo ta he thong |
| AI TOOLKIT.md | Huong dan su dung AI |

---

**Cap nhat:** 10/06/2026
**Trang thai:** Admin Quiz Management - Hoan thien
