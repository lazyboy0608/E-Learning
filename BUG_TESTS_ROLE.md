# BUG_TEST_ROLES.md

# 1. Mô tả vấn đề

## Bối cảnh

Hệ thống E-Learning hiện tại có hai loại câu hỏi:

### Admin Question

```text
scope = system
```

* Được tạo bởi Admin.
* Có thể được sử dụng cho toàn hệ thống.

### Teacher Question

```text
scope = class
```

* Được tạo bởi Teacher.
* Chỉ nên được sử dụng trong phạm vi lớp học mà Teacher quản lý.

---

## Yêu cầu nghiệp vụ

### Admin

Admin tạo bài thi:

```text
scope = system
```

Mọi học sinh trên hệ thống đều có thể tiếp cận.

---

### Teacher

Teacher tạo bài thi:

```text
scope = class
```

Chỉ học sinh thuộc lớp được gán bài thi mới được tiếp cận.

---

## Lỗi hiện tại

Mặc dù Question đã được phân biệt:

```text
system
class
```

nhưng khi tạo Test:

```text
Test trở thành global
```

Kết quả:

* Học sinh lớp A thấy được bài thi của lớp B.
* Học sinh không thuộc bất kỳ lớp nào vẫn thấy bài thi của Teacher.
* Teacher không thể giới hạn bài thi cho một hoặc nhiều lớp cụ thể.

---

# 2. Đánh giá hiện trạng hệ thống

## Kiến trúc hiện tại

### Quan hệ dữ liệu

```text
User
 |
ClassUser
 |
Class
 |
ClassTest
 |
Test
 |
TestQuestion
 |
Question
```

---

## Những phần đã làm tốt

### Question

```php
Question.php
```

Đã có:

```php
'scope'
```

=> Đúng.

---

### ClassUser

```php
class_users
```

Đã quản lý:

```text
Teacher ↔ Class
Student ↔ Class
```

=> Đúng.

---

### ClassTest

```php
class_tests
```

Đã tồn tại.

=> Đây là bảng đúng để gán:

```text
Class ↔ Test
```

---

### ClassController

Đã có API:

```php
POST /classes/{class}/tests
```

và

```php
assignTest()
```

=> Chứng tỏ kiến trúc ban đầu đã hướng tới mô hình:

```text
Class ↔ Test
```

---

# 3. Các vấn đề phát hiện được

## BUG 1 - Test không được gán vào Class

### Hiện trạng

Frontend gửi:

```json
{
  "class_id": 5
}
```

Backend:

```php
Test::create(...)
```

Sau đó kết thúc.

Không có gán cho lớp:

```php
ClassTest::create(...)
```

hoặc:

```php
$class->tests()->attach(...)
```

---

### Hậu quả

Test được tạo.

Nhưng:

```text
Không thuộc lớp nào.
```

---

## BUG 2 - Test model thiếu relation classes()

### File

```php
app/Models/Test.php
```

### Hiện tại

Không có:

```php
classes()
```

---

### Hậu quả

Không thể:

```php
$test->classes()
```

Không thể:

```php
sync()
attach()
whereHas()
```

---

## BUG 3 - getAvailableTestsForUser() sai logic

### File

```php
app/Repositories/TestRepository.php
```

### Hiện tại

```php
$query->orWhere(...)
$query->orWhere(...)
$query->orWhere(...)
```

liên tục.

---

### Hậu quả

Điều kiện quá lỏng.

Học sinh lớp A vẫn nhìn thấy:

```text
Test lớp B
```

---

## BUG 4 - Start Test có thể bypass bằng API

### File

```php
TestService.php
```

### Hiện trạng

Chỉ cần biết:

```text
testId
```

là có thể:

```http
POST /tests/{id}/start
```

---

### Hậu quả

Người dùng có thể:

```text
Làm bài thi không thuộc lớp của mình.
```

---

## BUG 5 - CreateTestPage chỉ hỗ trợ class_id

### File

```jsx
CreateTestPage.jsx
```

### Hiện tại

```js
class_id: ''
```

---

### Hậu quả

Một bài thi chỉ gán được cho một lớp.

Không tận dụng được:

```text
class_tests
```

---

## BUG 6 - Scope của Test đang không nhất quán

### File

```php
TestRepository.php
```

Có:

```php
->where('scope', 'system')
```

---

### Nhưng

Migration:

```php
create_tests_table.php
```

KHÔNG có:

```php
scope
```

---

### Hậu quả

Logic:

```php
getSystemTests()
```

không đáng tin cậy.

---

# 4. Hướng xử lý được chọn

## Phương án A

Giữ nguyên:

```text
class_tests
```

và mở rộng nó.

Không thêm:

```php
tests.class_id
```

---

### Lý do

Kiến trúc hiện tại đã chuẩn hóa:

```text
Class ↔ Test
```

quan hệ nhiều-nhiều.

Một bài thi có thể:

```text
Thuộc nhiều lớp.
```

---

# 5. Các file cần sửa

---

# File 1

## app/Models/Test.php

### Hiện tại

```php
public function attempts()
{
    return $this->hasMany(TestAttempt::class);
}
```

---

### Thêm

```php
public function classes()
{
    return $this->belongsToMany(
        ClassModel::class,
        'class_tests',
        'test_id',
        'class_id'
    );
}
```

---

# File 2

## app/Http/Requests/Test/StoreTestRequest.php

### Thêm

```php
'class_ids' => [
    'required_if:access_type,class_only',
    'array'
],

'class_ids.*' => [
    'exists:classes,id'
],
```

---

### Messages

```php
'class_ids.required_if'
    => 'Vui lòng chọn ít nhất một lớp học.',

'class_ids.array'
    => 'Danh sách lớp học không hợp lệ.',

'class_ids.*.exists'
    => 'Một trong các lớp học không tồn tại.',
```

---

# File 3

## app/Http/Requests/Test/UpdateTestRequest.php

### Thêm

```php
'class_ids' => [
    'required_if:access_type,class_only',
    'array'
],

'class_ids.*' => [
    'exists:classes,id'
],
```

---

# File 4

## app/Repositories/TestRepository.php

### Hàm

```php
createTest()
```

---

### Hiện tại

```php
$test = Test::create($data);
```

---

### Sửa

```php
$test = Test::create($data);

if (!empty($data['class_ids'])) {

    $test->classes()->attach(
        $data['class_ids']
    );

}
```

---

# File 5

## app/Repositories/TestRepository.php

### Hàm

```php
updateTest()
```

---

### Thêm

```php
if (isset($data['class_ids'])) {

    $test->classes()->sync(
        $data['class_ids']
    );

}
```

---

# File 6

## app/Repositories/TestRepository.php

### Hàm

```php
getAvailableTestsForUser()
```

---

### Hiện tại

Sử dụng nhiều:

```php
orWhere()
```

---

### Phải sửa

```php
$classIds = ClassUser::where(
    'user_id',
    $userId
)->pluck('class_id');

return Test::where(function ($q) use ($classIds) {

    $q->where('access_type', 'public_code');

    $q->orWhereHas(
        'classes',
        function ($sub) use ($classIds) {

            $sub->whereIn(
                'classes.id',
                $classIds
            );

        }
    );

});
```

---

# File 7

## app/Services/TestService.php

### Hàm

```php
startTest()
```

---

### Trước khi tạo Attempt

Bắt buộc thêm:

```php
canAccessTest(
    $userId,
    $testId
)
```

---

### Nếu không có quyền

```php
return [
    'success' => false,
    'error' => 'You do not have access to this test.'
];
```

---

# File 8

## src/pages/teacher/CreateTestPage.jsx

---

### Hiện tại

```js
class_id: ''
```

---

### Sửa

```js
class_ids: []
```

---

### Hiện tại

```jsx
<select>
```

---

### Sửa

Checkbox nhiều lựa chọn:

```jsx
{classes.map(cls => (
  <label key={cls.id}>
    <input
      type="checkbox"
      checked={
        formData.class_ids.includes(cls.id)
      }
      onChange={() =>
        toggleClass(cls.id)
      }
    />
    {cls.name}
  </label>
))}
```

---

### Payload gửi lên

```json
{
  "title": "Quiz Chương 1",
  "subject_id": 1,
  "access_type": "class_only",
  "class_ids": [1, 2],
  "question_ids": [10, 11, 12]
}
```

---

# 6. Thứ tự ưu tiên sửa lỗi

## Mức độ Critical

1. Test.php thêm classes()
2. createTest() attach class_ids
3. updateTest() sync class_ids
4. getAvailableTestsForUser()
5. canAccessTest()

---

## Mức độ High

6. StoreTestRequest
7. UpdateTestRequest

---

## Mức độ Medium

8. CreateTestPage.jsx

---

# 7. Kết quả mong đợi sau khi sửa

Teacher tạo bài thi:

```text
Quiz Chương 1
```

gán cho:

```text
Lớp A
Lớp B
```

---

Kết quả:

✅ Học sinh lớp A nhìn thấy.

✅ Học sinh lớp B nhìn thấy.

❌ Học sinh lớp C không nhìn thấy.

❌ Người ngoài lớp không thể start test bằng API.

✅ Phân quyền bài thi hoạt động đúng theo yêu cầu nghiệp vụ.
