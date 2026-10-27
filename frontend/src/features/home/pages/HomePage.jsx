import { useNavigate } from 'react-router-dom';
import '../home.css';

function HomePage() {
  const navigate = useNavigate();

  const subjects = [
    { icon: '🔢', name: 'Toán học', level: 'Lớp 1 - 12' },
    { icon: '📖', name: 'Tiếng Việt / Ngữ Văn', level: 'Lớp 1 - 12' },
    { icon: '🌍', name: 'Tiếng Anh', level: 'Chuẩn GDPT' },
    { icon: '🔬', name: 'Khoa học Tự nhiên', level: 'Vật lý • Hóa • Sinh' },
    { icon: '🏛️', name: 'Lịch sử & Địa lý', level: 'Chương trình mới' },
    { icon: '💻', name: 'Tin học', level: 'Kỹ năng số' },
  ];

  return (
    <div className="homepage">
      {/* Header */}
      <header className="hp-header">
        <div className="hp-header-inner">
          <div className="hp-logo">
            <span className="hp-logo-icon">📚</span>
            <span className="hp-logo-text">SmartEdu</span>
          </div>

          <nav className="hp-nav">
            <a href="#about" className="hp-nav-link">Giới thiệu</a>
            <a href="#subjects" className="hp-nav-link">Môn học</a>
            <a href="#features" className="hp-nav-link">Tính năng</a>
          </nav>

          <div className="hp-auth-btns">
            <button
              id="btn-login"
              className="hp-btn hp-btn-outline"
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </button>
            <button
              id="btn-register"
              className="hp-btn hp-btn-solid"
              onClick={() => navigate('/register')}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hp-hero">
        <div className="hp-hero-content">
          <div className="hp-hero-badge">🎒 Nền tảng Dạy &amp; Học Giáo dục Phổ thông</div>
          <h1 className="hp-hero-title">
            Học tập chủ động,<br />
            <span className="hp-hero-title-accent">Vững bước tương lai</span>
          </h1>
          <p className="hp-hero-desc">
            Hệ thống học tập và kiểm tra trực tuyến bám sát chương trình Giáo dục phổ thông.
            Đa dạng hình thức luyện tập, chấm điểm tự động và kết nối trực tiếp cùng thầy cô giáo.
          </p>
          <div className="hp-hero-actions">
            <button
              className="hp-btn hp-btn-solid hp-btn-lg"
              onClick={() => navigate('/login/student')}
            >
              👨‍🎓 Tham gia lớp học
            </button>
            <button
              className="hp-btn hp-btn-ghost hp-btn-lg"
              onClick={() => navigate('/login/teacher')}
            >
              👩‍🏫 Dành cho Giáo viên
            </button>
          </div>
          <div className="hp-hero-stats">
            <div className="hp-stat">
              <span className="hp-stat-num">10.000+</span>
              <span className="hp-stat-label">Học sinh phổ thông</span>
            </div>
            <div className="hp-stat-divider" />
            <div className="hp-stat">
              <span className="hp-stat-num">2.500+</span>
              <span className="hp-stat-label">Đề thi &amp; Luyện tập</span>
            </div>
            <div className="hp-stat-divider" />
            <div className="hp-stat">
              <span className="hp-stat-num">100%</span>
              <span className="hp-stat-label">Chuẩn khung GDPT</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Cards */}
        <div className="hp-hero-visual">
          {/* Main Visual Card */}
          <div className="hp-visual-card hp-vc-main">
            <div className="hp-vc-avatar">📐</div>
            <div className="hp-vc-info">
              <p className="hp-vc-name">Toán &amp; Tiếng Việt Phổ Thông</p>
              <p className="hp-vc-sub">Chương trình GDPT mới • Lớp 1 - 12</p>
              <div className="hp-vc-progress-bar">
                <div className="hp-vc-progress-fill" style={{ width: '85%' }} />
              </div>
              <p className="hp-vc-pct">85% Hoàn thành xuất sắc</p>
            </div>
          </div>

          {/* Floating Card 1 */}
          <div className="hp-visual-card hp-vc-float1">
            <span>🌟</span>
            <span>Điểm 10 Xuất sắc</span>
            <span className="hp-vc-badge-sub">Bài thi vừa hoàn thành</span>
          </div>

          {/* Floating Card 2 */}
          <div className="hp-visual-card hp-vc-float2">
            <span>🧩 4 Dạng bài tập</span>
            <span>Trắc nghiệm • Nối cặp • Điền bảng</span>
          </div>

          <div className="hp-circle hp-circle-1" />
          <div className="hp-circle hp-circle-2" />
        </div>
      </section>

      {/* Dải các môn học phổ thông */}
      <section id="subjects" className="hp-subjects-section">
        <div className="hp-subjects-inner">
          <p className="hp-subjects-header-label">Môn học bám sát chương trình phổ thông</p>
          <div className="hp-subjects-grid">
            {subjects.map((item, index) => (
              <div key={index} className="hp-subject-pill">
                <span className="hp-subject-icon">{item.icon}</span>
                <div className="hp-subject-text">
                  <span className="hp-subject-name">{item.name}</span>
                  <span className="hp-subject-level">{item.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="hp-features">
        <h2 className="hp-section-title">Vì sao Thầy Cô và Học Sinh tin chọn?</h2>
        <p className="hp-section-sub">
          Môi trường học tập trực quan, thân thiện và kết nối toàn diện giữa nhà trường, giáo viên và học sinh
        </p>
        <div className="hp-features-grid">
          {[
            {
              icon: '🎯',
              title: 'Chương trình chuẩn GDPT',
              desc: 'Hệ thống bài học và đề luyện tập xây dựng theo chuẩn chương trình Giáo dục phổ thông từ Tiểu học đến THPT.',
            },
            {
              icon: '👨‍🏫',
              title: 'Thầy cô đồng hành',
              desc: 'Giáo viên dễ dàng tạo lớp, chia sẻ tài liệu học tập, tổ chức thi kiểm tra và nhận xét bài làm trực tiếp.',
            },
            {
              icon: '🧩',
              title: '4 Dạng bài tập tương tác',
              desc: 'Đa dạng hình thức: Trắc nghiệm (MCQ), Điền khuyết, Nối cặp đôi và Điền bảng giúp học sinh hứng thú học tập.',
            },
            {
              icon: '📊',
              title: 'Đánh giá tiến độ thông minh',
              desc: 'Chấm điểm tự động tức thì, phân tích vùng kiến thức cần cải thiện và tích hợp công nghệ chống gian lận hiện đại.',
            },
          ].map((feature, index) => (
            <div key={index} className="hp-feature-card">
              <div className="hp-feature-icon">{feature.icon}</div>
              <h3 className="hp-feature-title">{feature.title}</h3>
              <p className="hp-feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="hp-footer">
        <p>© 2026 SmartEdu - Hệ thống Web Dạy &amp; Học Giáo dục Phổ thông. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;