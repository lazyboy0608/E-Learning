import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  themeColor = 'blue' // 'blue' | 'emerald'
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Cấu hình màu sắc theo theme
  const themes = {
    blue: {
      activeBg: '#2563eb',
      activeText: '#ffffff',
      activeBorder: '#2563eb',
      hoverBg: '#eff6ff',
      hoverText: '#1d4ed8'
    },
    emerald: {
      activeBg: '#059669',
      activeText: '#ffffff',
      activeBorder: '#059669',
      hoverBg: '#ecfdf5',
      hoverText: '#047857'
    }
  };

  const theme = themes[themeColor] || themes.blue;

  // Thuật toán hiển thị các số trang (Smart pagination với dấu ...)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Thông tin số lượng hiển thị */}
      <div style={{ fontSize: '13px', color: '#64748b' }}>
        Hiển thị <strong style={{ color: '#0f172a' }}>{startItem}</strong> - <strong style={{ color: '#0f172a' }}>{endItem}</strong> trên tổng số <strong style={{ color: '#0f172a' }}>{totalItems}</strong> câu hỏi
      </div>

      {/* Cụm nút điều khiển chuyển trang */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Nút Trước */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: currentPage === 1 ? '#94a3b8' : '#334155',
              fontSize: '13px',
              fontWeight: '500',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.6 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            <FiChevronLeft size={16} />
            <span>Trước</span>
          </button>

          {/* Các nút số trang */}
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  style={{
                    padding: '6px 10px',
                    color: '#94a3b8',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;

            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                style={{
                  minWidth: '34px',
                  height: '34px',
                  padding: '0 8px',
                  borderRadius: '8px',
                  border: isActive ? `1px solid ${theme.activeBorder}` : '1px solid #cbd5e1',
                  backgroundColor: isActive ? theme.activeBg : '#ffffff',
                  color: isActive ? theme.activeText : '#334155',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {p}
              </button>
            );
          })}

          {/* Nút Sau */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: currentPage === totalPages ? '#94a3b8' : '#334155',
              fontSize: '13px',
              fontWeight: '500',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.6 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            <span>Sau</span>
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
