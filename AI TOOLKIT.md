AI TOOLKIT -- PROMPT GUIDELINES FOR DEVELOPMENT TEAM

1.  Mục đích

Tài liệu này giúp team viết prompt chuẩn khi sử dụng AI (ChatGPT, Copilot, v.v.) để:

- Sinh code đúng kiến trúc dự án

- Tránh sai cấu trúc backend

- Giữ consistency toàn bộ hệ thống

- Tăng tốc độ development  
  Cách sử dụng: cấp tài liệu này cho 1 chatbot bất kỳ, kèm thông tin về các tài liệu hệ thống đã gửi, rồi nói yêu cầu thứ muốn làm và nhớ chatbot sinh prompt, chatbot sẽ trả prompt chuẩn để dán cho AI agent làm

2.  Nguyên tắc chung khi viết prompt

Luôn phải cung cấp đầy đủ context:

- Dự án là web dạy học (practice + test + class)

- Backend: Laravel

- Kiến trúc: Controller → Service → Strategy → Repository → Model

- Không viết logic trong Controller

- Dữ liệu câu hỏi dùng JSON

- Chấm điểm dùng Strategy Pattern

3.  Template prompt chuẩn

Sử dụng format sau:

You are working on a Laravel backend project.

Project context:

\- Web learning system (Practice + Test + Class)

\- Architecture: Controller → Service → Strategy → Repository → Model

\- Question uses JSON structure

\- Scoring uses Strategy Pattern

Task:

\[describe task clearly\]

Requirements:

\- Do not put business logic in Controller

\- Use Service layer

\- Follow existing architecture

\- Clean and readable code

4.  Prompt cho từng loại task

4.1. Tạo Controller

Create a Laravel Controller for \[feature\].

Requirements:

\- Only handle request/response

\- Call Service layer

\- No business logic inside Controller

\- Use FormRequest for validation

4.2. Tạo Service

Create a Service class for \[feature\].

Requirements:

\- Handle all business logic

\- Call Repository for database

\- Return clean structured response

4.3. Tạo Strategy (chấm điểm)

Create a scoring strategy class for question type \[type\].

Requirements:

\- Implement ScoringStrategyInterface

\- Function: check(question, answer)

\- Use question.data JSON

\- Return true/false

4.4. Tạo Repository

Create a Repository for \[entity\].

Requirements:

\- Handle database queries

\- Do not put business logic

\- Use Eloquent

4.5. Tạo API flow (Test)

Create full flow for test submission.

Requirements:

\- Validate input

\- Load test and questions

\- Loop each question

\- Use Strategy to check answer

\- Save test_attempt and test_answers

\- Calculate score

4.6. Tạo validation (FormRequest)

Create a Laravel FormRequest for \[feature\].

Requirements:

\- Validate all required fields

\- Follow database schema

5.  Prompt cho frontend (React)

Create a React component for \[feature\].

Context:

\- Question types: mcq, fill_blank, matching, table_fill

Requirements:

\- Render UI based on question type

\- Handle user input

\- Return answer in correct format

6.  Yêu cầu về UI/CSS (BẮT BUỘC)

Khi viết prompt liên quan đến frontend, phải bổ sung:

- Màu sắc tươi sáng, phù hợp học sinh tiểu học

- Giao diện đơn giản, dễ nhìn

- Animation nhẹ (hover, transition), không phức tạp

- Không sử dụng hiệu ứng nặng hoặc gây rối

- Tuyệt đối không lạm dụng emoji

- Ưu tiên icon hoặc hình ảnh thay cho emoji

7.  Những lỗi cần tránh khi viết prompt

- Không cung cấp context dự án

- Không nhắc kiến trúc Service layer

- Yêu cầu viết logic trong Controller

- Không nói rõ question dùng JSON

- Không nhắc Strategy Pattern

- UI sử dụng quá nhiều màu hoặc emoji

8.  Prompt nâng cao (full feature)

Implement full feature \[feature name\].

Context:

\- Laravel backend

\- Architecture: Controller → Service → Strategy → Repository

\- JSON-based question system

Requirements:

\- Create Controller

\- Create Service

\- Use Strategy if needed

\- Use Repository for DB

\- Follow clean architecture

\- Include validation

9.  Checklist trước khi gửi prompt

- Đã ghi rõ feature chưa

- Đã ghi kiến trúc chưa

- Đã yêu cầu dùng Service chưa

- Có tránh Controller logic chưa

- Có nói đến JSON và Strategy chưa

- UI có đúng guideline (màu sắc, animation, không emoji) chưa
