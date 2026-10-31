import React from 'react';
import {
  FiFileText,
  FiClipboard,
  FiBookOpen,
  FiUserCheck,
  FiBell,
  FiClock,
  FiExternalLink,
  FiArrowRight,
} from 'react-icons/fi';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getAnnouncementConfig = (type) => {
  switch (type) {
    case 'material':
      return {
        icon: FiFileText,
        bgColor: '#eff6ff',
        color: '#2563eb',
        borderColor: '#bfdbfe',
        badge: 'Tài liệu',
        badgeBg: '#dbeafe',
        badgeColor: '#1e40af',
      };
    case 'test':
      return {
        icon: FiClipboard,
        bgColor: '#fffbeb',
        color: '#d97706',
        borderColor: '#fde68a',
        badge: 'Bài kiểm tra',
        badgeBg: '#fef3c7',
        badgeColor: '#92400e',
      };
    case 'practice':
      return {
        icon: FiBookOpen,
        bgColor: '#faf5ff',
        color: '#9333ea',
        borderColor: '#e9d5ff',
        badge: 'Bài ôn tập',
        badgeBg: '#f3e8ff',
        badgeColor: '#6b21a8',
      };
    case 'student_joined':
      return {
        icon: FiUserCheck,
        bgColor: '#f0fdf4',
        color: '#16a34a',
        borderColor: '#bbf7d0',
        badge: 'Thành viên',
        badgeBg: '#dcfce7',
        badgeColor: '#166534',
      };
    default:
      return {
        icon: FiBell,
        bgColor: '#f8fafc',
        color: '#475569',
        borderColor: '#e2e8f0',
        badge: 'Thông báo',
        badgeBg: '#f1f5f9',
        badgeColor: '#334155',
      };
  }
};

const ClassAnnouncementFeed = ({ announcements = [], loading = false, onNavigateTest, onNavigatePractice }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0', color: '#64748b' }}>
        <span>Đang tải thông báo...</span>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: '#64748b',
          }}
        >
          <FiBell size={28} />
        </div>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 6px 0' }}>
          Chưa có thông báo nào
        </h4>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Các hoạt động mới như tài liệu, bài kiểm tra hay thành viên mới tham gia sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          Dòng thời gian hoạt động ({announcements.length})
        </h3>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#16a34a',
            backgroundColor: '#dcfce7',
            padding: '4px 10px',
            borderRadius: '9999px',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
          Cập nhật trực tiếp
        </span>
      </div>

      {announcements.map((item) => {
        const config = getAnnouncementConfig(item.type);
        const IconComponent = config.icon;

        return (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: `1px solid ${config.borderColor}`,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            {/* Icon Avatar */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: config.bgColor,
                color: config.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '20px',
              }}
            >
              <IconComponent />
            </div>

            {/* Content Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    backgroundColor: config.badgeBg,
                    color: config.badgeColor,
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {config.badge}
                </span>

                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  {item.title}
                </h4>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginLeft: 'auto',
                  }}
                >
                  <FiClock size={12} />
                  {formatTime(item.created_at)}
                </span>
              </div>

              <p style={{ fontSize: '14px', color: '#334155', margin: '0 0 12px 0', lineHeight: '1.6' }}>
                {item.content}
              </p>

              {/* Actions based on type */}
              {item.type === 'material' && item.data?.file_url && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={item.data.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#2563eb',
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      border: '1px solid #bfdbfe',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <FiExternalLink size={14} />
                    Xem tài liệu PDF
                    {item.data.original_name && (
                      <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '12px' }}>
                        ({item.data.original_name})
                      </span>
                    )}
                  </a>
                </div>
              )}

              {item.type === 'test' && item.data?.test_id && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => onNavigateTest && onNavigateTest(item.data.test_id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#b45309',
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                      cursor: 'pointer',
                    }}
                  >
                    Làm bài kiểm tra ngay
                    <FiArrowRight size={14} />
                  </button>
                </div>
              )}

              {item.type === 'practice' && item.data?.practice_id && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => onNavigatePractice && onNavigatePractice(item.data.practice_id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#7e22ce',
                      backgroundColor: '#f3e8ff',
                      borderRadius: '8px',
                      border: '1px solid #e9d5ff',
                      cursor: 'pointer',
                    }}
                  >
                    Làm bài ôn tập ngay
                    <FiArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClassAnnouncementFeed;

