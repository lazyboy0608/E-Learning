import React, { useEffect, useState } from 'react';
import api from '../../../../services/api'; // Axios instance tự động đính token
import { authService } from '../../../../services/authService';

function StudentDashboardPage() {
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser(); // Lấy thông tin user đã lưu khi login

    useEffect(() => {
        // Gọi API lấy profile chi tiết của user đang đăng nhập (được bảo vệ bởi auth:sanctum)
        api.get('/me') 
            .then(response => {
                setStudentInfo(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi lấy thông tin học tập:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Đang tải dữ liệu từ hệ thống...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Bảng Điều Khiển Sinh Viên</h1>
            <p>Xin chào, <strong>{user?.name}</strong> (Mã số: {user?.id})</p>
            
            <div style={{ background: '#f0f2f5', padding: '15px', borderRadius: '8px' }}>
                <h3>Thông tin đồng bộ từ Database Laravel:</h3>
                {studentInfo ? (
                    <ul>
                        <li>Email: {studentInfo.email}</li>
                        <li>Vai trò hệ thống: {studentInfo.role}</li>
                        <li>Ngày tham gia: {new Date(studentInfo.created_at).toLocaleDateString('vi-VN')}</li>
                    </ul>
                ) : (
                    <p style={{ color: 'red' }}>Không thể kết nối lấy dữ liệu thực tế từ API.</p>
                )}
            </div>
            
            <button 
                onClick={() => authService.logout()} 
                style={{ marginTop: '20px', padding: '10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Đăng Xuất
            </button>
        </div>
    );
}

export default StudentDashboardPage;