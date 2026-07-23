import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiFileText, FiClipboard, FiPlus, FiTrash2, FiX, FiBookOpen, FiBarChart2 } from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import classApi from '../../../api/classApi';
import { testApi } from '../../../api/testApi';
import { practiceApi } from '../../../api/practiceApi';
import { exportToExcel } from '../../../utils/exportHelper';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const pageContainerStyle = {
  display: 'block',
  width: '100%',
  maxWidth: '1152px',
  margin: '0 auto',
  boxSizing: 'border-box',
  textAlign: 'left',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  width: '100%',
  boxSizing: 'border-box',
};

const addButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontWeight: '600',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  whiteSpace: 'nowrap',
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  textAlign: 'center',
  width: '100%',
  boxSizing: 'border-box',
};

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(17, 24, 39, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px',
  boxSizing: 'border-box',
};

const modalContentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '480px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
};

const modalLabelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '6px',
};

const modalInputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  outline: 'none',
  color: '#111827',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

const modalHintStyle = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '6px 0 0 0',
  lineHeight: '1.5',
};

const cancelButtonStyle = {
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  cursor: 'pointer',
};

const ModalField = ({ label, hint, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={modalLabelStyle}>{label}</label>
    {children}
    {hint && <p style={modalHintStyle}>{hint}</p>}
  </div>
);

const ModalFooter = ({ onCancel, onConfirm, confirmLabel = 'Thêm' }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #f3f4f6',
    backgroundColor: '#f9fafb',
  }}>
    <button type="button" onClick={onCancel} style={cancelButtonStyle} className="hover:bg-gray-50">
      Huỷ
    </button>
    <button type="button" onClick={onConfirm} style={addButtonStyle}>
      {confirmLabel}
    </button>
  </div>
);

const SectionHeader = ({ title, onAdd, addLabel }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>{title}</h3>
    <button onClick={onAdd} style={addButtonStyle}>
      <FiPlus style={{ fontSize: '16px' }} />
      {addLabel}
    </button>
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div style={emptyStateStyle}>
    <Icon style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px', display: 'block' }} />
    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{message}</p>
  </div>
);

const ClassDetailPage = () => {  const { classId } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState('student');

  // Students state
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');

  // Materials state
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', file_url: '', type: 'pdf' });

  // Tests state
  const [tests, setTests] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');

  // Practices state
  const [practices, setPractices] = useState([]);
  const [availablePractices, setAvailablePractices] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState('');

  // Scores state
  const [selectedScoreTest, setSelectedScoreTest] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [loadingScores, setLoadingScores] = useState(false);

  useEffect(() => {
    fetchClassDetail(true);
  }, [classId]);

  const fetchClassDetail = async (showLoadingOverlay = false) => {
  try {
    if (showLoadingOverlay) {
      setLoading(true);
    }
    const response = await classApi.getClassDetail(classId);
    if (response.success) {
  setClassData(response.data);
  
  // Đổi u.class_pivot thành u.pivot
      setStudents(response.data.users?.filter(u => u.pivot?.role === 'student') || []);

      setMaterials(response.data.materials || []);
      setTests(response.data.tests || []);
      setPractices(response.data.practices || []);
}
  } catch (error) {
    console.error('Failed to fetch class detail:', error);
    alert('Không thể lấy thông tin lớp');
  } finally {
    setLoading(false);
  }
};

  const handleRemoveStudent = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học sinh này không?')) return;

    try {
      await classApi.removeStudent(classId, userId);
      setStudents(students.filter(s => s.id !== userId));
    } catch (error) {
      console.error('Failed to remove student:', error);
      alert('Xóa thất bại!');
    }
  };

  const handleAddStudent = async () => {
  if (!studentId.trim()) return;

  try {
    const response = await classApi.addStudent(classId, parseInt(studentId));
    
    alert('Thêm học sinh thành công!');
    setStudentId('');
    setShowAddModal(false);
    fetchClassDetail();
  } catch (error) {
    console.error('Failed to add student:', error);
    alert(error.response?.data?.message || 'Thêm thất bại');
  }
};

  const handleAddMaterial = async () => {
    if (!newMaterial.title.trim() || !newMaterial.file_url.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      await classApi.addMaterial(classId, newMaterial);
      alert('Thêm thành công!');
      setNewMaterial({ title: '', description: '', file_url: '', type: 'pdf' });
      setShowAddModal(false);
      fetchClassDetail();
    } catch (error) {
      console.error('Failed to add material:', error);
      alert('Thêm thất bại!');
    }
  };

  const handleRemoveMaterial = async (materialId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) return;

    try {
      await classApi.removeMaterial(classId, materialId);
      setMaterials(materials.filter(m => m.id !== materialId));
    } catch (error) {
      console.error('Failed to remove material:', error);
      alert('Xóa tài liệu thất bại');
    }
  };

  const handleAddTest = async () => {
    if (!selectedTest) return;

    try {
      await classApi.assignTest(classId, parseInt(selectedTest));
      alert('Gán thành công!');
      setSelectedTest('');
      setShowAddModal(false);
      fetchClassDetail();
    } catch (error) {
      console.error('Failed to assign test:', error);
      alert(error.response?.data?.message || 'Gán thất bại');
    }
  };

  const handleRemoveTest = async (testId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài kiểm tra này không?')) return;

    try {
      await classApi.removeTest(classId, testId);
      setTests(tests.filter(t => t.id !== testId));
    } catch (error) {
      console.error('Failed to remove test:', error);
      alert('Xóa bài kiểm tra thất bại');
    }
  };

  const handleAddPractice = async () => {
    if (!selectedPractice) return;

    try {
      await classApi.assignPractice(classId, parseInt(selectedPractice));
      alert('Gán thành công!');
      setSelectedPractice('');
      setShowAddModal(false);
      fetchClassDetail();
    } catch (error) {
      console.error('Failed to assign practice:', error);
      alert(error.response?.data?.message || 'Gán thất bại');
    }
  };

  const handleRemovePractice = async (practiceId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài ôn tập này không?')) return;

    try {
      await classApi.removePractice(classId, practiceId);
      setPractices(practices.filter(p => p.id !== practiceId));
    } catch (error) {
      console.error('Failed to remove practice:', error);
      alert('Xóa bài ôn tập thất bại');
    }
  };

  const fetchAvailablePractices = async () => {
    try {
      const response = await practiceApi.getTeacherPractices();
      setAvailablePractices(response.data || []);
    } catch (error) {
      console.error('Failed to fetch practices:', error);
    }
  };

  const openAddModal = async (type) => {
    setAddModalType(type);
    setShowAddModal(true);

    if (type === 'test') {
      fetchAvailableTests();
    }
    if (type === 'practice') {
      fetchAvailablePractices();
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const response = await testApi.getTests();
      setAvailableTests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    }
  };

  const fetchClassScores = async (testId) => {
    if (!testId) {
      setScoreData(null);
      return;
    }
    setLoadingScores(true);
    try {
      const response = await classApi.getClassScores(classId, testId);
      setScoreData(response.data || response);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
      setScoreData(null);
    } finally {
      setLoadingScores(false);
    }
  };

  const renderStudentsTab = () => (
    <div>
      <SectionHeader
        title={`Danh sách học sinh (${students.length})`}
        onAdd={() => openAddModal('student')}
        addLabel="Thêm học sinh"
      />
      {students.length === 0 ? (
        <EmptyState icon={FiUsers} message="Chưa có học sinh nào" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ và tên</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa học sinh"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderMaterialsTab = () => (
    <div>
      <SectionHeader
        title={`Tài liệu học tập (${materials.length})`}
        onAdd={() => openAddModal('material')}
        addLabel="Thêm tài liệu"
      />
      {materials.length === 0 ? (
        <EmptyState icon={FiFileText} message="Chưa có tài liệu nào" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {materials.map((material) => (
            <div key={material.id} style={{ ...cardStyle, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>{material.title}</h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{material.type}</p>
                  {material.description && (
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: '8px 0 0 0', lineHeight: '1.5' }}>{material.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveMaterial(material.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Xóa tài liệu"
                >
                  <FiTrash2 className="text-base" />
                </button>
              </div>
              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: '12px', fontSize: '14px', color: '#2563eb', fontWeight: '500' }}
                className="hover:text-blue-800"
              >
                Xem tài liệu →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTestsTab = () => (
    <div>
      <SectionHeader
        title={`Bài kiểm tra (${tests.length})`}
        onAdd={() => openAddModal('test')}
        addLabel="Thêm bài kiểm tra"
      />
      {tests.length === 0 ? (
        <EmptyState icon={FiClipboard} message="Chưa có bài kiểm tra nào" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {tests.map((test) => (
            <div key={test.id} style={{ ...cardStyle, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>{test.title}</h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    {test.duration ? `${test.duration} phút` : 'Không giới hạn'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveTest(test.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Xóa bài kiểm tra"
                >
                  <FiTrash2 className="text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  const renderPracticesTab = () => (
    <div>
      <SectionHeader
        title={`Bài tập ôn tập (${practices.length})`}
        onAdd={() => openAddModal('practice')}
        addLabel="Thêm bài tập"
      />
      {practices.length === 0 ? (
        <EmptyState icon={FiBookOpen} message="Chưa có bài ôn tập nào" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {practices.map((practice) => (
            <div key={practice.id} style={{ ...cardStyle, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>{practice.title}</h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    {practice.questions_count ? `${practice.questions_count} câu` : 'Không giới hạn'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemovePractice(practice.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Xóa bài ôn tập"
                >
                  <FiTrash2 className="text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  const renderScoresTab = () => (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>
          Chọn bài kiểm tra
        </label>
        <select
          value={selectedScoreTest}
          onChange={(e) => {
            setSelectedScoreTest(e.target.value);
            fetchClassScores(e.target.value);
          }}
          style={{ width: '100%', maxWidth: '400px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', padding: '10px 16px', boxSizing: 'border-box', cursor: 'pointer' }}
        >
          <option value="">-- Chọn bài kiểm tra --</option>
          {tests.map((test) => (
            <option key={test.id} value={test.id}>{test.title}</option>
          ))}
        </select>
      </div>

      {!selectedScoreTest ? (
        <div style={{ ...emptyStateStyle, maxWidth: '400px', margin: '0 auto' }}>
          <FiBarChart2 style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px', display: 'block' }} />
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Vui lòng chọn bài kiểm tra để xem điểm.</p>
        </div>
      ) : loadingScores ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải điểm...</p>
        </div>
      ) : !scoreData?.scores?.length ? (
        <div style={{ ...emptyStateStyle, maxWidth: '400px', margin: '0 auto' }}>
          <FiBarChart2 style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px', display: 'block' }} />
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Chưa có học sinh nào nộp bài.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Phổ điểm BarChart */}
          <div style={{ ...cardStyle, padding: '24px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
              Biểu đồ phổ điểm bài kiểm tra
            </h4>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(() => {
                    const ranges = [
                      { name: '0 - 2 điểm', count: 0, fill: '#ef4444' },
                      { name: '2 - 4 điểm', count: 0, fill: '#f97316' },
                      { name: '4 - 6 điểm', count: 0, fill: '#eab308' },
                      { name: '6 - 8 điểm', count: 0, fill: '#3b82f6' },
                      { name: '8 - 10 điểm', count: 0, fill: '#22c55e' },
                    ];
                    scoreData.scores.forEach(item => {
                      const pct = scoreData.test?.max_points > 0 ? (item.earned_points / scoreData.test.max_points) * 100 : 0;
                      const score10 = (pct / 100) * 10;
                      if (score10 < 2) ranges[0].count++;
                      else if (score10 < 4) ranges[1].count++;
                      else if (score10 < 6) ranges[2].count++;
                      else if (score10 < 8) ranges[3].count++;
                      else ranges[4].count++;
                    });
                    return ranges;
                  })()}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="count" name="Số học sinh">
                    {
                      [
                        { fill: '#ef4444' },
                        { fill: '#f97316' },
                        { fill: '#eab308' },
                        { fill: '#3b82f6' },
                        { fill: '#22c55e' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scores Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm w-full">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {scoreData.test?.title} — {scoreData.scores.length} học sinh
                {scoreData.test?.max_points ? ` (Tối đa: ${scoreData.test.max_points} điểm)` : ''}
              </h4>
              <button
                onClick={() => {
                  const excelData = scoreData.scores.map(item => ({
                    'Họ và tên': item.student_name,
                    'Email': item.email,
                    'Số điện thoại': item.phone || '',
                    'Điểm số': item.earned_points !== undefined ? item.earned_points : '—',
                    'Trạng thái': item.status === 'submitted' ? 'Đã nộp' : 'Hết hạn'
                  }));
                  exportToExcel(excelData, `Bang_diem_${scoreData.test?.title || 'Lop_hoc'}`);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                className="hover:bg-green-700"
              >
                Xuất Excel bảng điểm
              </button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ và tên</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Điểm</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {scoreData.scores.map((item) => (
                    <tr key={item.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.student_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span style={{
                          fontWeight: '600',
                          color: item.earned_points / item.max_points >= 0.8 ? '#059669' : item.earned_points / item.max_points >= 0.5 ? '#d97706' : '#dc2626',
                        }}>
                          {item.earned_points !== undefined ? `${item.earned_points}` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span style={{
                          padding: '2px 10px',
                          borderRadius: '99px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: item.status === 'submitted' ? '#ecfdf5' : '#fef3c7',
                          color: item.status === 'submitted' ? '#059669' : '#d97706',
                        }}>
                          {item.status === 'submitted' ? 'Đã nộp' : 'Hết hạn'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  const renderAddModal = () => {
    if (!showAddModal) return null;

    const modalTitles = {
      student: { title: 'Thêm học sinh', subtitle: 'Nhập ID học sinh để thêm vào lớp học này.' },
      material: { title: 'Thêm tài liệu', subtitle: 'Tải lên hoặc liên kết tài liệu học tập cho lớp.' },
      test: { title: 'Gán bài kiểm tra', subtitle: 'Chọn bài kiểm tra để gán cho lớp học.' },
      practice: { title: 'Gán bài ôn tập', subtitle: 'Chọn bài ôn tập để gán cho lớp học.' },
    };

    const { title, subtitle } = modalTitles[addModalType] || { title: '', subtitle: '' };

    return (
      <div style={modalOverlayStyle} onClick={() => setShowAddModal(false)}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '20px 24px',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                {title}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                {subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              className="hover:bg-gray-200 hover:text-gray-800"
              aria-label="Đóng"
            >
              <FiX size={18} />
            </button>
          </div>

          <div style={{ padding: '24px 24px 0' }}>
            {addModalType === 'student' && (
              <ModalField
                label="ID học sinh"
                hint="Bạn có thể tìm ID học sinh trong trang quản lý người dùng."
              >
                <input
                  type="number"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Ví dụ: 12"
                  style={modalInputStyle}
                  autoFocus
                />
              </ModalField>
            )}

            {addModalType === 'material' && (
              <>
                <ModalField label="Tiêu đề">
                  <input
                    type="text"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    placeholder="Nhập tiêu đề tài liệu"
                    style={modalInputStyle}
                    autoFocus
                  />
                </ModalField>
                <ModalField label="Loại">
                  <select
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                    style={{ ...modalInputStyle, cursor: 'pointer' }}
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                    <option value="document">Document</option>
                    <option value="other">Khác</option>
                  </select>
                </ModalField>
                <ModalField label="Đường dẫn">
                  <input
                    type="text"
                    value={newMaterial.file_url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, file_url: e.target.value })}
                    placeholder="https://..."
                    style={modalInputStyle}
                  />
                </ModalField>
                <ModalField label="Mô tả">
                  <textarea
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    rows={3}
                    placeholder="Mô tả ngắn về tài liệu (tuỳ chọn)"
                    style={{ ...modalInputStyle, resize: 'vertical', minHeight: '88px' }}
                  />
                </ModalField>
              </>
            )}

            {addModalType === 'test' && (
              <ModalField label="Chọn bài kiểm tra">
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  style={{ ...modalInputStyle, cursor: 'pointer' }}
                  autoFocus
                >
                  <option value="">-- Chọn bài kiểm tra --</option>
                  {availableTests.map((test) => (
                    <option key={test.id} value={test.id}>{test.title}</option>
                  ))}
                </select>
              </ModalField>
            )}

            {addModalType === 'practice' && (
              <ModalField label="Chọn bài ôn tập">
                <select
                  value={selectedPractice}
                  onChange={(e) => setSelectedPractice(e.target.value)}
                  style={{ ...modalInputStyle, cursor: 'pointer' }}
                  autoFocus
                >
                  <option value="">-- Chọn bài ôn tập --</option>
                  {availablePractices.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </ModalField>
            )}
          </div>

          {addModalType === 'student' && (
            <ModalFooter
              onCancel={() => setShowAddModal(false)}
              onConfirm={handleAddStudent}
              confirmLabel="Thêm học sinh"
            />
          )}
          {addModalType === 'material' && (
            <ModalFooter
              onCancel={() => setShowAddModal(false)}
              onConfirm={handleAddMaterial}
              confirmLabel="Thêm tài liệu"
            />
          )}
          {addModalType === 'test' && (
            <ModalFooter
              onCancel={() => setShowAddModal(false)}
              onConfirm={handleAddTest}
              confirmLabel="Gán bài kiểm tra"
            />
          )}
          {addModalType === 'practice' && (
            <ModalFooter
              onCancel={() => setShowAddModal(false)}
              onConfirm={handleAddPractice}
              confirmLabel="Gán bài ôn tập"
            />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <TeacherLayout pageTitle="Chi tiết lớp">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải thông tin lớp học...</div>
        </div>
      </TeacherLayout>
    );
  }

  if (!classData) {
    return (
      <TeacherLayout pageTitle="Chi tiết lớp">
        <div style={{ ...emptyStateStyle, maxWidth: '480px', margin: '80px auto' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px 0' }}>Không tìm thấy lớp này</p>
          <button
            onClick={() => navigate('/teacher/classes')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
          >
            ← Quay lại danh sách lớp
          </button>
        </div>
      </TeacherLayout>
    );
  }

  const tabs = [
    { id: 'students', label: 'Học sinh', icon: FiUsers },
    { id: 'materials', label: 'Tài liệu', icon: FiFileText },
    { id: 'tests', label: 'Bài kiểm tra', icon: FiClipboard },
    { id: 'practices', label: 'Bài tập ôn tập', icon: FiBookOpen },
    { id: 'scores', label: 'Bảng điểm', icon: FiBarChart2 },
  ];

  return (
    <TeacherLayout pageTitle={classData.name}>
      <div style={pageContainerStyle}>
        <button
          onClick={() => navigate('/teacher/classes')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '24px',
          }}
          className="hover:text-blue-800"
        >
          <FiArrowLeft style={{ fontSize: '16px' }} />
          Quay lại danh sách lớp
        </button>

        <div style={{ ...cardStyle, padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>{classData.name}</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Mã lớp:{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
              {classData.class_code}
            </span>
          </p>
          {classData.description && (
            <p style={{ fontSize: '14px', color: '#4b5563', margin: '12px 0 0 0', lineHeight: '1.6' }}>{classData.description}</p>
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 16px', gap: '4px', overflowX: 'auto' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 16px',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#2563eb' : '#6b7280',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                    marginBottom: '-1px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s ease',
                  }}
                  className={isActive ? '' : 'hover:text-gray-800'}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: '24px' }}>
            {activeTab === 'students' && renderStudentsTab()}
            {activeTab === 'materials' && renderMaterialsTab()}
            {activeTab === 'tests' && renderTestsTab()}
            {activeTab === 'practices' && renderPracticesTab()}
            {activeTab === 'scores' && renderScoresTab()}
          </div>
        </div>

        {renderAddModal()}
      </div>
    </TeacherLayout>
  );};

export default ClassDetailPage;
