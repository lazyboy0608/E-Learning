**BÁO CÁO ĐỒ ÁN\
HỆ THỐNG WEB DẠY HỌC CHO HỌC SINH TIỂU HỌC**

1. **Giới thiệu**

Trong bối cảnh công nghệ ngày càng phát triển, việc ứng dụng các hệ thống học tập trực tuyến vào giáo dục đang trở thành xu hướng tất yếu. Đặc biệt đối với học sinh tiểu học, việc kết hợp giữa học tập và tương tác thông qua các nền tảng số giúp tăng hứng thú học tập và cải thiện hiệu quả tiếp thu kiến thức.

Dự án này xây dựng một hệ thống web dạy học cho học sinh tiểu học, cho phép học sinh luyện tập và kiểm tra kiến thức thông qua các dạng bài tập tương tác. Đồng thời, hệ thống hỗ trợ giáo viên quản lý lớp học, tạo nội dung học tập và theo dõi tiến trình học của học sinh.

Hệ thống được thiết kế theo hướng hiện đại, tập trung vào kiến trúc backend, khả năng mở rộng và áp dụng các nguyên lý thiết kế phần mềm như SOLID và các design pattern phổ biến.

2. **Mục tiêu hệ thống**

Hệ thống được xây dựng với các mục tiêu chính:

- Cung cấp môi trường học tập trực tuyến cho học sinh tiểu học
- Hỗ trợ nhiều dạng bài tập khác nhau như trắc nghiệm, điền chỗ trống, nối cột
- Cho phép luyện tập (Practice) và kiểm tra (Test) rõ ràng
- Hỗ trợ quản lý lớp học và tài liệu học tập
- Áp dụng kiến trúc phần mềm chuẩn, dễ mở rộng và bảo trì
3. **Kiến trúc tổng thể**

Hệ thống được xây dựng theo mô hình Client – Server gồm:

Frontend: sử dụng React (Vite) để xây dựng giao diện người dùng\
Backend: sử dụng Laravel để xử lý logic và cung cấp API\
Database: sử dụng MySQL để lưu trữ dữ liệu

Backend được thiết kế theo kiến trúc phân lớp (Layered Architecture):

Controller → Service → Strategy → Repository → Model → Database

Trong đó:

- Controller: tiếp nhận request và trả response
- Service: xử lý logic nghiệp vụ
- Strategy: xử lý chấm điểm theo từng loại câu hỏi
- Repository: truy xuất dữ liệu
- Model: ánh xạ với database

Kiến trúc này giúp tách biệt rõ ràng các thành phần, tăng khả năng mở rộng và dễ bảo trì.

4. **Vai trò người dùng**

Hệ thống gồm ba loại người dùng:

Admin:

- Quản lý hệ thống tổng thể
- Quản lý tài khoản người dùng
- Phân quyền hệ thống

Teacher:

- Tạo và quản lý lớp học
- Thêm học sinh vào lớp
- Tạo câu hỏi và bài test
- Gán bài test cho lớp
- Upload tài liệu học tập
- Theo dõi kết quả học sinh

Student:

- Tham gia lớp học
- Làm bài Practice
- Làm bài Test (bằng mã hoặc trong lớp)
- Xem kết quả và tiến trình học
5. **Cơ chế học tập**

Hệ thống hỗ trợ hai cơ chế học tập chính:

**5.1. Practice**

- Học sinh làm từng câu hỏi riêng lẻ
- Hệ thống chấm điểm ngay lập tức
- Hiển thị kết quả đúng/sai và lời giải thích
- Lưu lại tiến trình học

**5.2. Test**

- Học sinh làm bài kiểm tra gồm nhiều câu hỏi
- Có thể có giới hạn thời gian
- Không hiển thị đáp án trong quá trình làm bài
- Kết quả được hiển thị sau khi nộp bài
6. **Cơ chế truy cập bài test**

Hệ thống sử dụng cơ chế truy cập linh hoạt thông qua mã (test\_code) kết hợp với lớp học.

Bài test có ba chế độ truy cập:

- public\_code: bất kỳ học sinh nào có mã đều có thể truy cập
- class\_only: chỉ học sinh thuộc lớp mới được làm bài
- both: vừa có thể truy cập bằng mã, vừa có thể truy cập từ lớp

Cơ chế này giúp hệ thống linh hoạt trong việc phân phối bài kiểm tra.

7. **Hệ thống lớp học**

Mỗi lớp học bao gồm:

- Danh sách học sinh (class\_users)
- Tài liệu học tập riêng (class\_materials)
- Danh sách bài test (class\_tests)

Giáo viên có thể tạo lớp, thêm học sinh và quản lý nội dung học tập trong lớp.

Lớp học đóng vai trò là một lớp mở rộng của hệ thống, không thay thế cơ chế test\_code mà bổ sung thêm khả năng quản lý.

8. **Hệ thống câu hỏi**

Câu hỏi được thiết kế theo cấu trúc JSON nhằm đảm bảo tính linh hoạt.

Mỗi câu hỏi bao gồm:

- type: loại câu hỏi
- content: nội dung
- media: hình ảnh hoặc âm thanh (nếu có)
- data: dữ liệu chi tiết (JSON)
- explanation: lời giải thích

Hệ thống hỗ trợ nhiều loại câu hỏi:

- Trắc nghiệm (MCQ)
- Điền vào chỗ trống (Fill Blank)
- Nối cột (Matching)
- Điền bảng (Table Fill)
9. **Cơ chế chấm điểm**

Hệ thống sử dụng Strategy Pattern để xử lý chấm điểm.

Mỗi loại câu hỏi có một strategy riêng:

- McqStrategy
- FillBlankStrategy
- MatchingStrategy
- TableFillStrategy

Factory Pattern được sử dụng để lựa chọn strategy phù hợp dựa trên loại câu hỏi.

Cách tiếp cận này giúp hệ thống dễ mở rộng khi thêm loại câu hỏi mới mà không cần sửa code cũ.

10. **Thiết kế cơ sở dữ liệu**

Database được thiết kế theo mô hình quan hệ.

Các bảng chính bao gồm:

- users
- questions
- tests
- test\_attempts
- test\_answers
- question\_progress

Các bảng mở rộng:

- classes
- class\_users
- class\_materials
- class\_tests

Dữ liệu câu hỏi và câu trả lời được lưu dưới dạng JSON để hỗ trợ nhiều loại câu hỏi khác nhau.

11. **Luồng hoạt động chính**

Luồng Practice:

Học sinh gửi câu trả lời → Controller → Service → Strategy → Database → trả kết quả

Luồng Test:

Học sinh nhập mã → kiểm tra test → tạo attempt → làm bài → submit → chấm điểm → lưu kết quả

Luồng Class:

Học sinh vào lớp → xem tài liệu → làm bài test trong lớp

12. **Áp dụng nguyên lý thiết kế**

Hệ thống áp dụng các nguyên lý SOLID:

- Single Responsibility: mỗi lớp chỉ có một nhiệm vụ
- Open/Closed: dễ mở rộng mà không sửa code cũ
- Dependency Injection: giảm phụ thuộc giữa các thành phần

Ngoài ra, hệ thống sử dụng các design pattern:

- Service Layer Pattern
- Repository Pattern
- Strategy Pattern
- Factory Pattern
12. **Hướng phát triển**

Hệ thống có thể mở rộng thêm:

- Random câu hỏi trong test
- Shuffle đáp án
- Adaptive learning
- Gamification (điểm, level)
- Phân tích kết quả học tập

