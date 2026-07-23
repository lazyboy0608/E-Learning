import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiPlus,
  FiTrash2,
  FiSearch,
  FiArrowLeft,
  FiSave,
  FiClock,
  FiCalendar,
  FiBookOpen,
  FiCheckSquare,
  FiSquare,
  FiPlusCircle,
} from "react-icons/fi";
import TeacherLayout from "../../../components/teacher/TeacherLayout";
import { testApi } from "../../../api/testApi";
import { questionApi } from "../../../api/questionApi";
import subjectApi from "../../../api/subjectApi";
import classApi from "../../../api/classApi";

export function CreateTestPage() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const isEditing = !!testId;

  const [formData, setFormData] = useState({
    title: "",
    subject_id: "",
    class_ids: [],
    access_type: "both",
    is_active: true,
    expires_at: "",
    max_attempts: "",
    duration: "",
    question_ids: [],
    question_scores: {},
  });

  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    try {
      const [questionsRes, subjectsRes, classesRes] = await Promise.all([
        questionApi.getClassQuestions({ per_page: 1000 }),
        subjectApi.getSubjects(),
        classApi.getClasses(),
      ]);

      setAvailableQuestions(questionsRes.data || questionsRes || []);
      setSubjects(subjectsRes.data || subjectsRes || []);
      const classesData = classesRes?.data || classesRes;
      setClasses(Array.isArray(classesData) ? classesData : []);

      if (isEditing) {
        const testRes = await testApi.getTestDetails(testId);

        console.log("TEST DATA:", testRes.data);

        const test = testRes.data;

        setFormData({
          title: test.title || "",
          subject_id: test.subject_id?.toString() || "",
          class_ids: test.classes?.map(cls => cls.id) || [],
          access_type: test.access_type || "both",
          is_active: test.is_active ?? true,
          expires_at: test.expires_at ? test.expires_at.split("T")[0] : "",
          max_attempts: test.max_attempts || "",
          duration: test.duration || "",
          question_ids: test.questions?.map((q) => q.id) || [],
          question_scores: {},
        });

        const scores = {};
        test.questions?.forEach((q) => {
          scores[q.id] = q.pivot?.score || 1;
        });
        setFormData((prev) => ({ ...prev, question_scores: scores }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleToggleQuestion = (questionId) => {
    setFormData((prev) => {
      const newIds = prev.question_ids.includes(questionId)
        ? prev.question_ids.filter((id) => id !== questionId)
        : [...prev.question_ids, questionId];

      return { ...prev, question_ids: newIds };
    });
  };

  const handleScoreChange = (questionId, score) => {
    setFormData((prev) => ({
      ...prev,
      question_scores: {
        ...prev.question_scores,
        [questionId]: parseFloat(score) || 1,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.question_ids.length === 0) {
      alert("Vui lòng chọn ít nhất một câu hỏi.");
      return;
    }

    try {
      setSaving(true);
      const submitData = {
        ...formData,
        subject_id: formData.subject_id
          ? parseInt(formData.subject_id, 10)
          : null,
        class_ids: Array.isArray(formData.class_ids) ? formData.class_ids.map(id => Number(id)) : [],
        max_attempts: formData.max_attempts
          ? parseInt(formData.max_attempts, 10)
          : null,
        duration: formData.duration ? parseInt(formData.duration, 10) : null,
      };

      if (isEditing) {
        await testApi.updateTest(testId, submitData);
      } else {
        await testApi.createTest(submitData);
      }

      navigate("/teacher/tests");
    } catch (error) {
      console.error("Failed to save test:", error);
      alert("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = availableQuestions.filter((q) => {
    const subjectMatches = !formData.subject_id || q.subject?.id?.toString() === formData.subject_id.toString();
    const searchMatches = q.content?.toLowerCase().includes(searchQuery.toLowerCase()) || q.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return subjectMatches && searchMatches;
  });

  // Trả về cấu trúc màu sang xịn mịn cho từng Badge loại câu hỏi
  const getQuestionTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case "mcq":
        return {
          label: "Trắc nghiệm",
          class: "bg-blue-50 text-blue-700 border-blue-100",
        };
      case "fill_blank":
        return {
          label: "Điền từ",
          class: "bg-emerald-50 text-emerald-700 border-emerald-100",
        };
      case "matching":
        return {
          label: "Nối đáp án",
          class: "bg-purple-50 text-purple-700 border-purple-100",
        };
      default:
        return {
          label: "Tự luận",
          class: "bg-slate-50 text-slate-700 border-slate-100",
        };
    }
  };

  const toggleClass = (classId) => {
    setFormData(prev => {
      const newClassIds = prev.class_ids.includes(classId)
        ? prev.class_ids.filter(id => id !== classId)
        : [...prev.class_ids, classId];
  
      return {
        ...prev,
        class_ids: newClassIds,
      };
    });
  };

  if (loading) {
    return (
      <TeacherLayout pageTitle="Đang tải...">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-500 font-medium text-sm">
            Đang nạp cơ sở dữ liệu phòng thi...
          </p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      pageTitle={isEditing ? "Hiệu chỉnh bài thi" : "Khởi tạo đề thi mới"}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 16px 64px 16px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= HEADER ACTION BAR ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "16px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1e293b",
              }}
            >
              {isEditing ? "✏️ Chỉnh sửa bài kiểm tra" : "Tạo bài kiểm tra mới"}
            </h1>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
                color: "#94a3b8",
              }}
            >
              Thiết lập cấu hình phòng thi và cấu trúc điểm số bài kiểm tra.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={() => navigate("/teacher/tests")}
              style={{
                px: "16px",
                py: "10px",
                height: "40px",
                backgroundColor: "#fff",
                border: "1px solid #cbd5e1",
                color: "#475569",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 16px",
              }}
            >
              <FiArrowLeft /> Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving || formData.question_ids.length === 0}
              style={{
                height: "40px",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 20px",
                opacity: saving || formData.question_ids.length === 0 ? 0.5 : 1,
                shadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <FiSave />{" "}
              {saving
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật đề"
                  : "Lưu đề thi"}
            </button>
          </div>
        </div>

        {/* ================= KHỐI THÔNG TIN CƠ BẢN ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h2
            style={{
              margin: "0",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "12px",
            }}
          >
            <span
              style={{
                width: "4px",
                height: "16px",
                backgroundColor: "#2563eb",
                borderRadius: "4px",
                display: "inline-block",
              }}
            ></span>
            Cấu hình thông tin cơ bản
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Tiêu đề */}
            <div>
              <label
                style={{
                  display: "block",
                  textTransform: "uppercase",
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#64748b",
                  letterSpacing: "0.05em",
                  marginBottom: "6px",
                }}
              >
                Tiêu đề bài kiểm tra *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="VD: Kiểm tra giữa kỳ - Toán lớp 2"
                style={{
                  w: "100%",
                  width: "100%",
                  px: "16px",
                  py: "10px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  focus: "outline-none",
                  boxSizing: "border-box",
                  padding: "10px 16px",
                }}
              />
            </div>

            {/* Môn học & Lớp áp dụng */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#64748b",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                  }}
                >
                  Môn học *
                </label>
                <select
                  name="subject_id"
                  required
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    padding: "10px 16px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Chọn môn học</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#64748b",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                  }}
                >
                  Lớp áp dụng
                </label>
                {classes.map((cls) => (
                  <label key={cls.id}>
                    <input
                      type="checkbox"
                      checked={(formData.class_ids || []).includes(cls.id)}
                      onChange={() => toggleClass(cls.id)}
                    />
                    {cls.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Hình thức & Thời gian */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#64748b",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                  }}
                >
                  Hình thức truy cập
                </label>
                <select
                  name="access_type"
                  value={formData.access_type}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    padding: "10px 16px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="both">Mã truy cập & Lớp học</option>
                  <option value="public_code">Chỉ mã truy cập</option>
                  <option value="class_only">Chỉ lớp học</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#64748b",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                  }}
                >
                  Thời gian làm bài (phút)
                </label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="VD: 30"
                    style={{
                      width: "100%",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "14px",
                      padding: "10px 40px 10px 16px",
                      boxSizing: "border-box",
                    }}
                  />
                  <FiClock
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "13px",
                      color: "#94a3b8",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Lượt thi tối đa & Ngày hết hạn */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#64748b",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                  }}
                >
                  Số lần thi tối đa
                </label>
                <input
                  type="number"
                  name="max_attempts"
                  value={formData.max_attempts}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="VD: 3"
                  style={{
                    width: "100%",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    padding: "10px 16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#64748b",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                  }}
                >
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    padding: "10px 16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Checkbox Kích hoạt bài kiểm tra */}
            <div style={{ paddingTop: "6px" }}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#334155",
                  }}
                >
                  Kích hoạt bài kiểm tra hiển thị trên hệ thống
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ================= KHỐI LỰA CHỌN CÂU HỎI NGÂN HÀNG ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "14px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <h2
              style={{
                margin: "0",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "4px",
                  height: "16px",
                  backgroundColor: "#4f46e5",
                  borderRadius: "4px",
                  display: "inline-block",
                }}
              ></span>
              Danh sách câu hỏi ngân hàng
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#4f46e5",
                  backgroundColor: "#e0e7ff",
                  padding: "2px 10px",
                  borderRadius: "99px",
                  marginLeft: "6px",
                }}
              >
                Đã chọn {formData.question_ids.length} câu
              </span>
            </h2>

            {/* Input tìm kiếm tách biệt hàng ngang */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{ position: "relative", width: "280px", flex: "none" }}
              >
                <FiSearch
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "11px",
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm nội dung câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => navigate("/teacher/questions/create")}
                style={{
                  height: "36px",
                  backgroundColor: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 14px",
                  flexShrink: 0,
                  boxShadow: "0 1px 3px rgba(79,70,229,0.3)",
                }}
              >
                <FiPlus /> Thêm câu hỏi
              </button>
            </div>
          </div>

          {/* Vùng cuộn danh sách câu hỏi */}
          <div
            style={{
              maxHeight: "380px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingRight: "4px",
            }}
          >
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => {
                const isSelected = formData.question_ids.includes(question.id);
                const badge = getQuestionTypeBadge(question.type);
                return (
                  <div
                    key={question.id}
                    onClick={() => handleToggleQuestion(question.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      padding: "16px",
                      borderRadius: "12px",
                      border: isSelected
                        ? "1px solid #c7d2fe"
                        : "1px solid #f1f5f9",
                      backgroundColor: isSelected ? "#f5f7ff" : "#ffffff",
                      transition: "all 0.15s ease",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        flex: "1",
                        minWidth: "0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "20px",
                          marginTop: "2px",
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected ? (
                          <FiCheckSquare style={{ color: "#4f46e5" }} />
                        ) : (
                          <FiSquare style={{ color: "#cbd5e1" }} />
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          flex: "1",
                          minWidth: "0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge.class}`}
                            style={{ display: "inline-block" }}
                          >
                            {badge.label}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                              fontWeight: "500",
                            }}
                          >
                            {question.subject?.name || "Môn học"}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#334155",
                            lineHeight: "1.5",
                            wordBreak: "break-word",
                          }}
                        >
                          {question.content}
                        </p>
                      </div>
                    </div>

                    {/* Điểm số góc bên phải */}
                    {isSelected && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "#ffffff",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          flexShrink: 0,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            color: "#94a3b8",
                          }}
                        >
                          ĐIỂM:
                        </span>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={formData.question_scores[question.id] ?? 1}
                          onChange={(e) =>
                            handleScoreChange(question.id, e.target.value)
                          }
                          style={{
                            width: "45px",
                            textAlign: "center",
                            fontSize: "13px",
                            fontWeight: "bold",
                            border: "none",
                            backgroundColor: "#f8fafc",
                            padding: "2px 4px",
                            borderRadius: "4px",
                            outline: "none",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 16px",
                  border: "1px dashed #e2e8f0",
                  borderRadius: "12px",
                  backgroundColor: "#fafafa",
                }}
              >
                <FiBookOpen
                  style={{
                    fontSize: "36px",
                    color: "#cbd5e1",
                    marginBottom: "8px",
                  }}
                />
                <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>
                  Không tìm thấy câu hỏi phù hợp.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </TeacherLayout>
  );
}

export default CreateTestPage;
