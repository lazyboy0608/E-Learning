import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCheck, FiX, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import StudentLayout from '../../../components/student/StudentLayout';
import QuestionRenderer from '../../../components/student/QuestionRenderer';
import practiceApi from '../../../api/practiceApi';

const pageContainerStyle = {
  width: '100%',
  maxWidth: '768px',
  margin: '0 auto',
  padding: '24px',
  boxSizing: 'border-box',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  padding: '24px',
  width: '100%',
  boxSizing: 'border-box',
};

const purpleButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 20px',
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  fontWeight: '600',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
};

const PracticeSessionPage = () => {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await practiceApi.getPracticeQuestions(practiceId);
      if (response.success) {
        setQuestions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  }, [practiceId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAnswer = useCallback((userAnswer) => {
    setAnswer(userAnswer);
  }, []);

  const handleCheckAnswer = async () => {
    if (answer === null) return;

    try {
      const response = await practiceApi.submitAnswer({
        question_id: questions[currentIndex].id,
        answer,
      });
      setResult(response.data || null);
      setShowResult(true);
    } catch (error) {
      console.error('Failed to check answer:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswer(null);
      setShowResult(false);
      setResult(null);
    } else {
      navigate('/student/practice/complete');
    }
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Luyện tập">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải câu hỏi...</div>
        </div>
      </StudentLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <StudentLayout pageTitle="Luyện tập">
        <div style={{ ...pageContainerStyle, textAlign: 'center' }}>
          <div style={{ ...cardStyle, padding: '48px 24px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px 0' }}>Không có câu hỏi nào</p>
            <button
              onClick={() => navigate('/student/practice')}
              style={{ ...purpleButtonStyle, display: 'inline-flex' }}
              className="hover:bg-purple-700"
            >
              <FiArrowLeft />
              Quay lại
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <StudentLayout pageTitle={`Câu ${currentIndex + 1} / ${questions.length}`}>
      <div style={pageContainerStyle}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
              Tiến độ: {currentIndex + 1}/{questions.length}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#7c3aed' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#7c3aed',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
              Câu hỏi {currentIndex + 1}
            </span>
          </div>

          <QuestionRenderer
            question={currentQuestion}
            onAnswer={handleAnswer}
            answer={answer}
            showResult={showResult}
            result={result}
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
            onClick={() => navigate('/student/practice')}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            className="hover:text-gray-800"
          >
            Thoát
          </button>

          {!showResult ? (
            <button
              onClick={handleCheckAnswer}
              disabled={answer === null}
              style={{
                ...purpleButtonStyle,
                opacity: answer === null ? 0.5 : 1,
                cursor: answer === null ? 'not-allowed' : 'pointer',
              }}
              className="hover:bg-purple-700"
            >
              Kiểm tra
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: result?.is_correct ? '#16a34a' : '#dc2626',
              }}>
                {result?.is_correct ? <FiCheck /> : <FiX />}
                {result?.is_correct ? 'Đúng!' : 'Sai!'}
              </span>
              <button
                onClick={handleNext}
                style={purpleButtonStyle}
                className="hover:bg-purple-700"
              >
                {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
                <FiArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default PracticeSessionPage;
