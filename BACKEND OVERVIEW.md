BACKEND OVERVIEW + FOLDER STRUCTURE (CÓ THỂ THAY ĐỔI)

-----
1. Kiến trúc

Backend sử dụng kiến trúc:

Controller → Service → Strategy → Repository → Model → Database

- Controller: nhận request, trả response
- Service: xử lý logic nghiệp vụ
- Strategy: chấm điểm theo loại câu hỏi
- Repository: truy vấn dữ liệu
- Model: ánh xạ database
-----
2. Module chính
- Auth: đăng nhập, phân quyền
- Question: quản lý câu hỏi
- Practice: luyện tập
- Test: bài kiểm tra
- Class: lớp học và tài liệu
-----
3. Cấu trúc thư mục

app/

├── Http/

│   ├── Controllers/

│   │   ├── AuthController.php

│   │   ├── QuestionController.php

│   │   ├── PracticeController.php

│   │   ├── TestController.php

│   │   ├── ClassController.php

│   │

│   ├── Requests/

│   │   ├── Auth/

│   │   ├── Question/

│   │   ├── Practice/

│   │   ├── Test/

│   │   ├── Class/

│   │

│   ├── Middleware/

│

├── Services/

│   ├── AuthService.php

│   ├── QuestionService.php

│   ├── PracticeService.php

│   ├── TestService.php

│   ├── ClassService.php

│

├── Repositories/

│   ├── Interfaces/

│   │   ├── QuestionRepositoryInterface.php

│   │   ├── TestRepositoryInterface.php

│   │   ├── ClassRepositoryInterface.php

│   │

│   ├── QuestionRepository.php

│   ├── TestRepository.php

│   ├── ClassRepository.php

│

├── Strategies/

│   ├── Scoring/

│   │   ├── ScoringStrategyInterface.php

│   │   ├── McqStrategy.php

│   │   ├── FillBlankStrategy.php

│   │   ├── MatchingStrategy.php

│   │   ├── TableFillStrategy.php

│   │

│   ├── ScoringFactory.php

│

├── Models/

│   ├── User.php

│   ├── Question.php

│   ├── Test.php

│   ├── TestAttempt.php

│   ├── TestAnswer.php

│   ├── QuestionProgress.php

│   ├── ClassModel.php

│   ├── ClassUser.php

│   ├── ClassMaterial.php

│   ├── ClassTest.php

│   ├── Subject.php

│

├── Providers/

│   ├── RepositoryServiceProvider.php

-----
4. Luồng xử lý

Practice:

Request → Controller → Service → Strategy → Repository → DB → Response

Test:

Request → Controller → Service → Strategy → Repository → DB → Response

-----
5. Package sử dụng
- laravel/sanctum: authentication
- spatie/laravel-permission: role, permission
- barryvdh/laravel-debugbar (dev)
- barryvdh/laravel-ide-helper (dev)
-----
6. Phân chia công việc

Dev 1 – Auth + User

- AuthController
- AuthService
- Middleware
-----
Dev 2 – Question + Practice

- QuestionController
- QuestionService
- PracticeService
- Strategy
-----
Dev 3 – Test

- TestController
- TestService
- Test logic
-----
Dev 4 – Class

- ClassController
- ClassService
- Class materials
- Class tests
-----
7. Nguyên tắc
- Mỗi người làm 1 module
- Không sửa module khác
- Logic nằm trong Service
- Controller không xử lý logic

