DATABASE SCHEMA (FINAL)

---

1. users

- id: khóa chính
- name: tên người dùng
- email: email đăng nhập
- password: mật khẩu đã mã hóa
- role: admin | teacher | student
- phone : số điện thoại
- created_at
- updated_at

---

2. questions

- id: khóa chính
- subject_id: môn học
- type: loại câu hỏi (mcq, fill_blank, matching, table_fill)
- content: nội dung câu hỏi
- media_image: đường dẫn hình ảnh (nullable)
- media_audio: đường dẫn audio (nullable)
- data: JSON chứa cấu trúc câu hỏi và đáp án
- explanation: lời giải thích (nullable)
- created_by: teacher tạo câu hỏi
- created_at
- updated_at

---

3. question_progress

- id: khóa chính
- user_id: học sinh
- question_id: câu hỏi
- is_correct: đúng/sai lần gần nhất
- last_answer: JSON câu trả lời gần nhất
- attempt_count: số lần làm
- last_attempt_at: thời gian làm gần nhất

---

4. tests

- id: khóa chính
- title: tên bài test
- subject_id: môn học
- created_by: teacher tạo test
- test_code: mã truy cập (unique)
- access_type: public_code | class_only | both
- is_active: trạng thái hoạt động
- expires_at: thời gian hết hạn (nullable)
- max_attempts: số lần làm tối đa (nullable)
- duration: thời gian làm bài (phút, nullable)
- created_at
- updated_at

---

5. test_questions

- id: khóa chính
- test_id: bài test
- question_id: câu hỏi
- order_index: thứ tự câu hỏi (nullable)
- score: điểm của câu hỏi (nullable)

---

6. test_attempts

- id: khóa chính
- user_id: học sinh
- test_id: bài test
- attempt_no: lần làm thứ mấy
- started_at: thời gian bắt đầu
- submitted_at: thời gian nộp (nullable)
- expired_at: thời gian hết hạn attempt
- status: in_progress | submitted | expired
- score: điểm tổng
- created_at

---

7. test_answers

- id: khóa chính
- attempt_id: lần làm bài
- question_id: câu hỏi
- answer: JSON câu trả lời của học sinh
- is_correct: đúng/sai

---

8. classes

- id: khóa chính
- name: tên lớp
- created_by: teacher tạo lớp
- created_at
- updated_at

---

9. class_users

- id: khóa chính
- class_id: lớp học
- user_id: người dùng
- role: student | teacher (optional)

---

10. class_materials

- id: khóa chính
- class_id: lớp học
- title: tiêu đề tài liệu
- description: mô tả (nullable)
- file_url: đường dẫn file
- type: pdf | video | link | ...
- created_at

---

11. class_tests

- id: khóa chính
- class_id: lớp học
- test_id: bài test

---

12. subjects

- id: khóa chính
- name: tên môn học
- class_level: cấp/lớp (ví dụ: lớp 1, lớp 2)
