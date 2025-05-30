import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import './Quiz.css';

const Quiz = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const notification = useNotification();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    fetchQuiz();
    setStartTime(Date.now());
  }, [assessmentId]);

  useEffect(() => {
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      const response = await fetch(`/api/assessments/${assessmentId}`);
      const data = await response.json();
      setQuiz(data);
      setAnswers({});
    } catch (err) {
      setError('Failed to load quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    notification.show('Time is up! Submitting your answers...', 'warning');
    handleSubmit();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);

    const currentQuestionData = quiz.questions[currentQuestion];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        questionId: currentQuestionData.id,
        selectedOption: optionIndex,
        isCorrect: optionIndex === currentQuestionData.correctAnswer,
        category: currentQuestionData.category,
        topic: currentQuestionData.topic,
        timeTaken: Math.round((Date.now() - startTime) / 1000)
      }
    }));

    // Auto-advance to next question after a delay
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
        setStartTime(Date.now()); // Reset timer for next question
      }
    }, 1500);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const submissionData = {
        assessmentId,
        userId: currentUser.userId,
        answers: Object.values(answers),
        totalTime: Math.round((Date.now() - startTime) / 1000),
        categories: [...new Set(Object.values(answers).map(a => a.category))],
        score: calculateScore(),
        completedAt: new Date().toISOString()
      };

      // Replace with your actual API call
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();
      
      notification.show('Quiz submitted successfully!', 'success');
      navigate(`/results/${result.id}`);
    } catch (err) {
      notification.show('Failed to submit quiz. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = () => {
    const totalQuestions = quiz.questions.length;
    const correctAnswers = Object.values(answers).filter(a => a.isCorrect).length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{quiz?.title}</h2>
        {timeLeft !== null && (
          <div className={`timer ${timeLeft < 60 ? 'timer-warning' : ''}`}>
            <i className="bi bi-clock"></i>
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentQuestion + 1) / quiz?.questions.length) * 100}%` }}
        ></div>
        <span className="progress-text">
          Question {currentQuestion + 1} of {quiz?.questions.length}
        </span>
      </div>

      <div className="question-container">
        <div className="question-content">
          <div className="question-meta">
            <span className="category-tag">{quiz?.questions[currentQuestion].category}</span>
            {quiz?.questions[currentQuestion].topic && (
              <span className="topic-tag">{quiz?.questions[currentQuestion].topic}</span>
            )}
          </div>
          <h3>{quiz?.questions[currentQuestion].text}</h3>
          {quiz?.questions[currentQuestion].image && (
            <img 
              src={quiz.questions[currentQuestion].image} 
              alt="Question illustration"
              className="question-image"
            />
          )}
        </div>

        <div className="options-grid">
          {quiz?.questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                selectedOption === index ? 
                  (showFeedback ? 
                    (index === quiz.questions[currentQuestion].correctAnswer ? 'correct' : 'incorrect')
                    : 'selected') 
                  : ''
              }`}
              onClick={() => handleOptionSelect(index)}
              disabled={showFeedback || isSubmitting}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option}</span>
              {showFeedback && selectedOption === index && (
                <span className="feedback-icon">
                  {index === quiz.questions[currentQuestion].correctAnswer ? (
                    <i className="bi bi-check-circle-fill"></i>
                  ) : (
                    <i className="bi bi-x-circle-fill"></i>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {showFeedback && selectedOption !== quiz.questions[currentQuestion].correctAnswer && (
          <div className="feedback-explanation">
            <i className="bi bi-info-circle-fill"></i>
            <p>{quiz.questions[currentQuestion].explanation}</p>
          </div>
        )}
      </div>

      <div className="quiz-footer">
        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0 || showFeedback}
          >
            <i className="bi bi-arrow-left"></i>
            Previous
          </button>
          <button
            className="nav-button"
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={currentQuestion === quiz.questions.length - 1 || showFeedback}
          >
            Next
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>

        {currentQuestion === quiz.questions.length - 1 && (
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length !== quiz.questions.length}
          >
            {isSubmitting ? (
              <>
                <div className="spinner-small"></div>
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle"></i>
                Submit Quiz
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz; 