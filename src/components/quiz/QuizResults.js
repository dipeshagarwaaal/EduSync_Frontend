import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import './QuizResults.css';

const QuizResults = () => {
  const { resultId } = useParams();
  const { currentUser } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryAnalysis, setCategoryAnalysis] = useState({});
  const [filters, setFilters] = useState({
    scoreRange: 'all',
    status: 'all'
  });
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  useEffect(() => {
    fetchResults();
  }, [resultId]);

  useEffect(() => {
    if (results) {
      filterQuestions();
    }
  }, [filters, results]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      const response = await fetch(`/api/results/${resultId}`);
      const data = await response.json();
      setResults(data);
      setFilteredQuestions(data.questions);
      analyzeResults(data);
    } catch (err) {
      setError('Failed to load results. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    if (!results) return;

    let filtered = [...results.questions];

    // Filter by score range
    if (filters.scoreRange !== 'all') {
      const [min, max] = filters.scoreRange.split('-').map(Number);
      filtered = filtered.filter(question => {
        const score = question.score || 0;
        return score >= min && score <= max;
      });
    }

    // Filter by pass/fail status
    if (filters.status !== 'all') {
      const isPassed = filters.status === 'pass';
      filtered = filtered.filter(question => {
        return isPassed ? question.isCorrect : !question.isCorrect;
      });
    }

    setFilteredQuestions(filtered);
    analyzeResults({ ...results, questions: filtered });
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const analyzeResults = (data) => {
    const categories = {};
    data.questions.forEach(question => {
      if (!categories[question.category]) {
        categories[question.category] = {
          total: 0,
          correct: 0,
          incorrect: 0,
          questions: []
        };
      }
      
      categories[question.category].total++;
      if (question.isCorrect) {
        categories[question.category].correct++;
      } else {
        categories[question.category].incorrect++;
        categories[question.category].questions.push(question);
      }
    });
    
    setCategoryAnalysis(categories);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading results...</p>
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
    <div className="quiz-results-container">
      <div className="results-header">
        <h2>{results?.quiz.title} Results</h2>
        <div className="score-overview">
          <div className="score-circle" style={{
            background: `conic-gradient(
              ${results?.score >= 70 ? '#2ecc71' : '#e74c3c'} ${(results?.score || 0)}%,
              #ecf0f1 ${(results?.score || 0)}%
            )`
          }}>
            <div className="score-inner">
              <span className="score-value">{results?.score}%</span>
              <span className="score-label">Score</span>
            </div>
          </div>
          <div className="score-details">
            <div className="score-stat">
              <i className="bi bi-check-circle-fill text-success"></i>
              <span>{results?.correctAnswers} Correct</span>
            </div>
            <div className="score-stat">
              <i className="bi bi-x-circle-fill text-danger"></i>
              <span>{results?.incorrectAnswers} Incorrect</span>
            </div>
            <div className="score-stat">
              <i className="bi bi-clock-fill text-info"></i>
              <span>{results?.timeTaken} Minutes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="results-filters">
        <div className="filter-group">
          <label>Score Range:</label>
          <select 
            value={filters.scoreRange}
            onChange={(e) => handleFilterChange('scoreRange', e.target.value)}
          >
            <option value="all">All Scores</option>
            <option value="0-59">Below 60% (Poor)</option>
            <option value="60-69">60-69% (Fair)</option>
            <option value="70-79">70-79% (Good)</option>
            <option value="80-89">80-89% (Very Good)</option>
            <option value="90-100">90-100% (Excellent)</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Questions</option>
            <option value="pass">Correct Answers</option>
            <option value="fail">Incorrect Answers</option>
          </select>
        </div>
        <button 
          className="filter-reset"
          onClick={() => setFilters({ scoreRange: 'all', status: 'all' })}
        >
          <i className="bi bi-arrow-counterclockwise"></i>
          Reset Filters
        </button>
      </div>

      <div className="results-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="bi bi-pie-chart-fill"></i>
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          <i className="bi bi-journal-text"></i>
          Question Review
        </button>
        <button 
          className={`tab-button ${activeTab === 'improvement' ? 'active' : ''}`}
          onClick={() => setActiveTab('improvement')}
        >
          <i className="bi bi-graph-up"></i>
          Areas for Improvement
        </button>
      </div>

      <div className="results-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h3>Performance by Category</h3>
            <div className="categories-grid">
              {Object.entries(categoryAnalysis).map(([category, data]) => (
                <div className="category-card" key={category}>
                  <h4>{category}</h4>
                  <div className="category-stats">
                    <div className="category-progress">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(data.correct / data.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="category-numbers">
                      <span>{Math.round((data.correct / data.total) * 100)}%</span>
                      <span>{data.correct}/{data.total} correct</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="review-section">
            <div className="questions-list">
              {filteredQuestions.map((question, index) => (
                <div 
                  key={index}
                  className={`question-review-card ${question.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="question-header">
                    <span className="question-number">Question {index + 1}</span>
                    <span className={`status-badge ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                      <i className={`bi ${question.isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                      {question.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <div className="question-content">
                    <p className="question-text">{question.text}</p>
                    <div className="answers-comparison">
                      <div className="your-answer">
                        <span className="answer-label">Your Answer:</span>
                        <span className={`answer-text ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                          {question.userAnswer}
                        </span>
                      </div>
                      {!question.isCorrect && (
                        <div className="correct-answer">
                          <span className="answer-label">Correct Answer:</span>
                          <span className="answer-text correct">{question.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                    {!question.isCorrect && (
                      <div className="explanation">
                        <i className="bi bi-info-circle-fill"></i>
                        <p>{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'improvement' && (
          <div className="improvement-section">
            <h3>Areas Needing Improvement</h3>
            <div className="improvement-cards">
              {Object.entries(categoryAnalysis)
                .filter(([_, data]) => data.incorrect > 0)
                .sort((a, b) => b[1].incorrect - a[1].incorrect)
                .map(([category, data]) => (
                  <div className="improvement-card" key={category}>
                    <div className="improvement-header">
                      <h4>{category}</h4>
                      <span className="improvement-score">
                        {data.incorrect} incorrect answers
                      </span>
                    </div>
                    <div className="improvement-details">
                      <h5>Topics to Review:</h5>
                      <ul>
                        {data.questions.map((question, index) => (
                          <li key={index}>
                            <i className="bi bi-dot"></i>
                            {question.topic || question.text}
                          </li>
                        ))}
                      </ul>
                      <div className="resource-links">
                        <h5>Recommended Resources:</h5>
                        <Link to={`/courses?category=${category}`} className="resource-link">
                          <i className="bi bi-book"></i>
                          Related Courses
                        </Link>
                        <Link to={`/practice?category=${category}`} className="resource-link">
                          <i className="bi bi-lightning"></i>
                          Practice Exercises
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="results-actions">
        <Link to="/assessments" className="action-button secondary">
          <i className="bi bi-list-check"></i>
          All Assessments
        </Link>
        <Link to={`/assessments/${results?.quiz.id}`} className="action-button primary">
          <i className="bi bi-arrow-repeat"></i>
          Retake Quiz
        </Link>
      </div>
    </div>
  );
};

export default QuizResults; 