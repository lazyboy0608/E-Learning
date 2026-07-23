import { useNavigate } from 'react-router-dom';
import '../home.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <header className="hp-header">
        <div className="hp-header-inner">
          <div className="hp-logo">
            <span className="hp-logo-icon">📚</span>
            <span className="hp-logo-text">E-Learning</span>
          </div>

          <nav className="hp-nav">
            <a href="#about" className="hp-nav-link">Giới thiệu</a>
            <a href="#feature" className="hp-nav-link">Tính năng</a>
            <a href="#contact" className="hp-nav-link">Liên hệ</a>
          </nav>

          <div className="hp-auth-btns">
            <button
              id="btn-login"
              className="hp-btn hp-btn-outline"
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </button>
            <button id="btn-register" className="hp-btn hp-btn-solid" onClick={() => navigate('/register')}>
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      <section className="hp-hero">
        <div className="hp-hero-content">
          <div className="hp-hero-badge">🎓 Nền tảng học tập trực tuyến #1</div>
          <h1 className="hp-hero-title">
            Học mọi lúc,<br />
            <span className="hp-hero-title-accent">mọi nơi</span>
          </h1>
          <p className="hp-hero-desc">
            Khám phá hàng nghìn khóa học chất lượng cao từ các giáo viên hàng đầu.
            Nâng cao kỹ năng và mở ra cơ hội nghề nghiệp mới ngay hôm nay.
          </p>
          <div className="hp-hero-actions">
            <button
              className="hp-btn hp-btn-solid hp-btn-lg"
              onClick={() => navigate('/login')}
            >
              Bắt đầu học ngay
            </button>
            <button className="hp-btn hp-btn-ghost hp-btn-lg">
              Khám phá khóa học
            </button>
          </div>
          <div className="hp-hero-stats">
            <div className="hp-stat">
              <span className="hp-stat-num">10K+</span>
              <span className="hp-stat-label">Học viên</span>
            </div>
            <div className="hp-stat-divider" />
            <div className="hp-stat">
              <span className="hp-stat-num">500+</span>
              <span className="hp-stat-label">Khóa học</span>
            </div>
            <div className="hp-stat-divider" />
            <div className="hp-stat">
              <span className="hp-stat-num">200+</span>
              <span className="hp-stat-label">Giáo viên</span>
            </div>
          </div>
        </div>

        <div className="hp-hero-visual">
          <div className="hp-visual-card hp-vc-main">
            <div className="hp-vc-avatar">👨‍💻</div>
            <div className="hp-vc-info">
              <p className="hp-vc-name">Lập trình Web</p>
              <p className="hp-vc-sub">React &amp; Node.js</p>
              <div className="hp-vc-progress-bar">
                <div className="hp-vc-progress-fill" style={{ width: '72%' }} />
              </div>
              <p className="hp-vc-pct">72% hoàn thành</p>
            </div>
          </div>

          <div className="hp-visual-card hp-vc-float1">
            <span>🏆</span>
            <span>Chứng chỉ được cấp</span>
          </div>

          <div className="hp-visual-card hp-vc-float2">
            <span>⭐ 4.9</span>
            <span>Đánh giá trung bình</span>
          </div>

          <div className="hp-circle hp-circle-1" />
          <div className="hp-circle hp-circle-2" />
        </div>
      </section>

      <section id="about" className="hp-features">
        <h2 className="hp-section-title">Tại sao chọn E-Learning?</h2>
        <p className="hp-section-sub">
          Chúng tôi cung cấp trải nghiệm học tập tốt nhất cho bạn
        </p>
        <div className="hp-features-grid">
          {[
            { icon: '🎯', title: 'Học theo lộ trình', desc: 'Chương trình học được thiết kế bài bản, phù hợp với từng cấp độ.' },
            { icon: '👨‍🏫', title: 'Giáo viên chuyên nghiệp', desc: 'Đội ngũ giáo viên giàu kinh nghiệm, tận tâm hướng dẫn học viên.' },
            { icon: '📱', title: 'Học mọi thiết bị', desc: 'Truy cập khóa học trên điện thoại, máy tính bảng hay laptop.' },
            { icon: '🏅', title: 'Chứng chỉ uy tín', desc: 'Nhận chứng chỉ hoàn thành được công nhận rộng rãi trong ngành.' },
          ].map((feature, index) => (
            <div key={index} className="hp-feature-card">
              <div className="hp-feature-icon">{feature.icon}</div>
              <h3 className="hp-feature-title">{feature.title}</h3>
              <p className="hp-feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="hp-footer">
        <p>© 2025 E-Learning Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;