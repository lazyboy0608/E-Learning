import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import StatCard from '../../../components/admin/StatCard';
import { FiUsers, FiHelpCircle } from 'react-icons/fi';
import { userApi } from '../../../api/userApi';
import { questionApi } from '../../../api/questionApi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ teachers_count: 0, students_count: 0, questions_count: 0, daily_new_users: [], daily_attempts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, questionsRes] = await Promise.all([
          userApi.getStats(),
          questionApi.getSystemQuestions(),
        ]);
        if (statsRes.success) {
          setStats({
            ...statsRes.data,
            questions_count: Array.isArray(questionsRes?.data) ? questionsRes.data.length : 0,
            daily_new_users: statsRes.data.daily_new_users || [],
            daily_attempts: statsRes.data.daily_attempts || [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-section">
        <h3 className="admin-section-title">Overview</h3>
        <p className="admin-section-desc">
          Here's what's happening with your e-learning platform today.
        </p>

        <div className="admin-stat-cards">
          <StatCard
            title="Tổng số giáo viên"
            value={loading ? '...' : stats.teachers_count}
            icon={<FiUsers />}
            bgColor="#e0e7ff"
            color="#4f46e5"
          />
          <StatCard
            title="Tổng số học sinh"
            value={loading ? '...' : stats.students_count}
            icon={<FiUsers />}
            bgColor="#dcfce7"
            color="#16a34a"
          />
          <StatCard
            title="Tổng số câu hỏi"
            value={loading ? '...' : stats.questions_count}
            icon={<FiHelpCircle />}
            bgColor="#fef3c7"
            color="#d97706"
          />
        </div>

        {/* Biểu đồ phân tích hệ thống */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginTop: '24px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
                Người dùng mới (14 ngày qua)
              </h4>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.daily_new_users || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={d => d ? d.substring(5) : ''} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 6 }} name="Người dùng mới" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
                Lượt làm bài (14 ngày qua)
              </h4>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.daily_attempts || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={d => d ? d.substring(5) : ''} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Lượt thi" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;