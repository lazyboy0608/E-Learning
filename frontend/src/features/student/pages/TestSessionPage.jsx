import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiFlag,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { testApi } from "../../../api/testApi";
import { TestTimer } from "../../../components/student/TestTimer";
import { TestQuestionNav } from "../../../components/student/TestQuestionNav";
import { TestSubmitModal } from "../../../components/student/TestSubmitModal";
import { QuestionRenderer } from "../../../components/student/QuestionRenderer";

export function TestSessionPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [starting, setStarting] = useState(false);
  const started = useRef(false);

  // States for cheating detection
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false);

  // Refs
  const saveQueueRef = useRef({});
  const activeAttemptRef = useRef(null);
  const lastSwitchReported = useRef(0);

  useEffect(() => {
    if (started.current) return;

    started.current = true;

    startTest();
  }, []);

  // Lắng nghe sự kiện chuyển tab/mở ứng dụng khác để phát hiện gian lận
  useEffect(() => {
    const reportCheat = async () => {
      const now = Date.now();
      // Cooldown 2s
      if (now - lastSwitchReported.current < 2000) return;
      lastSwitchReported.current = now;

      if (!activeAttemptRef.current) return;

      try {
        setTabSwitchCount((prev) => prev + 1);
        setShowCheatModal(true);
        await testApi.reportTabSwitch(activeAttemptRef.current);
      } catch (error) {
        console.error("Failed to report tab switch:", error);
      }
    };

    const handleTabSwitch = () => {
      if (document.visibilityState === "hidden") {
        reportCheat();
      }
    };

    const handleWindowBlur = () => {
      reportCheat();
    };

    document.addEventListener("visibilitychange", handleTabSwitch);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleTabSwitch);
      window.removeEventListener("blur", handleWindowBlur);
      
      // Clear auto-save timeouts on unmount
      Object.values(saveQueueRef.current).forEach(clearTimeout);
    };
  }, []);

  const startTest = async () => {
    if (starting) return;
    setStarting(true);
    try {
      setLoading(true);
      const response = await testApi.startTest(testId);
      console.log("START TEST RESPONSE:", response);

      if (response.success && response.data) {
        const data = response.data;
        setTestData(data);
        setQuestions(data.questions || []);
        activeAttemptRef.current = data.attempt_id;

        // Restore tab switch count from backend if available
        if (typeof data.tab_switch_count === 'number') {
          setTabSwitchCount(data.tab_switch_count);
        }

        // Restore existing answers
        let restoredAnswers = data.existing_answers || {};
        const localSaved = localStorage.getItem(`attempt_${data.attempt_id}_answers`);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            restoredAnswers = { ...restoredAnswers, ...parsed };
          } catch (e) {
            console.error("Failed to parse local storage answers", e);
          }
        }
        setAnswers(restoredAnswers);
      }
    } catch (error) {
      console.error("Failed to start test:", error);
      alert("Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.");
      navigate("/student/tests");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = useCallback(
    (answer) => {
      if (!questions[currentIndex]) return;
      const questionId = questions[currentIndex].id;

      setAnswers((prev) => {
        const newAnswers = { ...prev, [questionId]: answer };
        if (testData?.attempt_id) {
          localStorage.setItem(`attempt_${testData.attempt_id}_answers`, JSON.stringify(newAnswers));
        }
        return newAnswers;
      });

      // Clear any pending timeout for this question
      if (saveQueueRef.current[questionId]) {
        clearTimeout(saveQueueRef.current[questionId]);
      }

      // Schedule API save after 800ms (Debounce)
      saveQueueRef.current[questionId] = setTimeout(async () => {
        try {
          if (testData?.attempt_id) {
            await testApi.saveAnswer(
              testData.attempt_id,
              questionId,
              answer
            );
          }
        } catch (err) {
          console.error("Failed to auto-save answer:", err);
        }
      }, 800);
    },
    [questions, currentIndex, testData]
  );

  const handleNavigate = (index) => {
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleFlag = () => {
    if (!questions[currentIndex]) return;
    const questionId = questions[currentIndex].id;
    setFlaggedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    );
  };

  const handleTimeUp = useCallback(() => {
    if (!testData?.attempt_id || submitting) return;
    setSubmitting(true);
    setShowSubmitModal(false);
    submitTest();
  }, [testData, submitting, answers]);

  const submitTest = async () => {
    try {
      // Clear any remaining timeouts before submission
      Object.values(saveQueueRef.current).forEach(clearTimeout);

      const response = await testApi.submitTest(
        testId,
        testData.attempt_id,
        Object.keys(answers).length > 0 ? answers : [],
      );

      if (response.success) {
        localStorage.removeItem(`attempt_${testData.attempt_id}_answers`);
        activeAttemptRef.current = null;
        navigate(`/student/tests/results/${testData.attempt_id}`, {
          state: { result: response.data },
        });
      }
    } catch (error) {
      const errorData = error?.response?.data;
      console.error("[submitTest] Failed:", errorData);
      if (errorData?.error === 'This attempt has expired.') {
        localStorage.removeItem(`attempt_${testData.attempt_id}_answers`);
        activeAttemptRef.current = null;
        const resultRes = await testApi.getTestResults(testData.attempt_id);
        navigate(`/student/tests/results/${testData.attempt_id}`, {
          state: { result: resultRes.data },
        });
      } else {
        alert("Không thể nộp bài. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <TestSessionSkeleton />;
  }

  if (!testData || questions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', backgroundColor: '#f5f6fa' }}>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Không thể tải bài kiểm tra.</p>
        <button
          onClick={() => navigate("/student/tests")}
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter(
    (id) => answers[id] !== null,
  ).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <div style={{
          maxWidth: '1152px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate("/student/tests")}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer',
              }}
              className="hover:bg-gray-200"
              title="Quay lại"
            >
              <FiArrowLeft style={{ fontSize: '18px', color: '#4b5563' }} />
            </button>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>{testData.test_title}</h1>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0 0' }}>
                Câu {currentIndex + 1} / {questions.length}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowNav(!showNav)}
              style={{
                padding: '8px 14px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
              }}
              className="hover:bg-gray-200"
            >
              {showNav ? "Ẩn danh sách" : "Hiện danh sách"}
            </button>

            <TestTimer
              expiredAt={testData.expired_at}
              initialSeconds={testData.remaining_time}
              onTimeUp={handleTimeUp}
            />

            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
              style={{
                padding: '10px 20px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: submitting ? 0.7 : 1,
              }}
              className="hover:bg-green-700"
            >
              Nộp bài
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {showNav && (
            <aside style={{ width: '280px', flexShrink: 0 }}>
              <TestQuestionNav
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                onNavigate={handleNavigate}
              />
            </aside>
          )}

          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '24px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                  Câu hỏi {currentIndex + 1}
                </span>
                <button
                  onClick={toggleFlag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: flaggedQuestions.includes(currentQuestion.id) ? '#fef3c7' : '#f3f4f6',
                    color: flaggedQuestions.includes(currentQuestion.id) ? '#d97706' : '#6b7280',
                  }}
                  className="hover:opacity-80"
                  title="Đánh dấu để xem lại"
                >
                  <FiFlag />
                </button>
              </div>

              <QuestionRenderer
                question={currentQuestion}
                onAnswer={handleAnswer}
                showResult={false}
                answer={answers[currentQuestion.id]}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '1px solid #e5e7eb',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  backgroundColor: currentIndex === 0 ? '#f9fafb' : '#ffffff',
                  color: currentIndex === 0 ? '#9ca3af' : '#374151',
                }}
              >
                <FiChevronLeft />
                Câu trước
              </button>

              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Đã trả lời: {answeredCount}/{questions.length}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                  }}
                  className="hover:bg-blue-700"
                >
                  Câu tiếp
                  <FiChevronRight />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                  }}
                  className="hover:bg-green-700"
                >
                  Nộp bài
                </button>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Submit Modal */}
      <TestSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={submitTest}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        isSubmitting={submitting}
      />

      {/* Cheat Warning Modal Overlay */}
      {showCheatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
            border: '2px solid #ef4444',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
              fontWeight: 'bold',
            }}>
              <FiAlertTriangle style={{ fontSize: '28px', color: '#dc2626' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 12px 0' }}>
              Cảnh báo vi phạm!
            </h2>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              Bạn vừa rời khỏi giao diện làm bài thi. Hành vi này đã bị hệ thống phát hiện và tự động báo cáo cho giáo viên.
            </p>
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              color: '#991b1b',
              fontWeight: '600',
              margin: '0 0 24px 0',
            }}>
              Lần vi phạm thứ: {tabSwitchCount}
            </div>
            <button
              onClick={() => setShowCheatModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s',
              }}
              className="hover:bg-red-700"
            >
              Tôi hiểu và cam kết không tái phạm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton loading component
export function TestSessionSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse" style={{ minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
      {/* Skeleton Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', height: '69px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="w-48 h-5 bg-gray-200 rounded"></div>
              <div className="w-24 h-3.5 bg-gray-150 rounded"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-28 h-9 bg-gray-200 rounded-lg"></div>
            <div className="w-24 h-9 bg-gray-200 rounded-lg"></div>
            <div className="w-24 h-9 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </header>

      {/* Skeleton Content */}
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
        <div className="flex gap-5 items-start">
          {/* Left panel skeleton */}
          <aside className="w-70 hidden md:block" style={{ width: '280px' }}>
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
              <div className="w-32 h-5 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-gray-105 rounded-lg" style={{ backgroundColor: '#f3f4f6', height: '40px', borderRadius: '8px' }}></div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Question skeleton */}
          <main className="flex-1 space-y-6" style={{ flex: 1 }}>
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px' }}>
              <div className="flex justify-between items-center mb-6">
                <div className="w-28 h-5 bg-gray-200 rounded"></div>
                <div className="w-9 h-9 bg-gray-105 rounded-lg" style={{ backgroundColor: '#f3f4f6', width: '36px', height: '36px', borderRadius: '8px' }}></div>
              </div>
              <div className="space-y-3 mb-8">
                <div className="w-full h-6 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-full h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center px-4 gap-3" style={{ height: '48px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', marginBottom: '12px' }}>
                    <div className="w-5 h-5 bg-gray-200 rounded-full" style={{ width: '20px', height: '20px', borderRadius: '50%' }}></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination skeleton */}
            <div className="flex justify-between items-center">
              <div className="w-28 h-10 bg-gray-200 rounded-lg" style={{ width: '112px', height: '40px', borderRadius: '8px' }}></div>
              <div className="w-32 h-5 bg-gray-150 rounded"></div>
              <div className="w-28 h-10 bg-gray-200 rounded-lg" style={{ width: '112px', height: '40px', borderRadius: '8px' }}></div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default TestSessionPage;
