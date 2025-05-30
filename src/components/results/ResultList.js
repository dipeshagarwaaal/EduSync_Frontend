import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import resultService from '../../services/resultService';
import assessmentService from '../../services/assessmentService';
import courseService from '../../services/courseService';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import './ResultList.css';

const ResultList = ({ userOnly = false }) => {
  const [results, setResults] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'attemptDate', direction: 'desc' });
  const { currentUser, isInstructor } = useAuth();
  const notification = useNotification();

  useEffect(() => {
    fetchData();
  }, [userOnly, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let resultData = await resultService.getAllResults();
      
      if (userOnly && currentUser) {
        resultData = resultData.filter(r => r.userId === currentUser.userId);
      }
      
      setResults(resultData);
      
      const assessmentData = await assessmentService.getAllAssessments();
      const assessmentMap = {};
      const uniqueCourseIds = new Set();
      
      assessmentData.forEach(assessment => {
        assessmentMap[assessment.assessmentId] = assessment;
        if (assessment.courseId) {
          uniqueCourseIds.add(assessment.courseId);
        }
      });
      
      setAssessments(assessmentMap);
      
      const courseIds = Array.from(uniqueCourseIds);
      const courseMap = {};
      
      for (const courseId of courseIds) {
        try {
          const course = await courseService.getCourseById(courseId);
          courseMap[courseId] = course;
        } catch (err) {
          console.error(`Failed to load course ${courseId}:`, err);
        }
      }
      
      setCourses(courseMap);
    } catch (err) {
      setError('Failed to load results. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortConfig.key === 'attemptDate') {
      return sortConfig.direction === 'asc'
        ? new Date(a.attemptDate) - new Date(b.attemptDate)
        : new Date(b.attemptDate) - new Date(a.attemptDate);
    }
    if (sortConfig.key === 'score') {
      const scoreA = a.score / (assessments[a.assessmentId]?.maxScore || 1);
      const scoreB = b.score / (assessments[b.assessmentId]?.maxScore || 1);
      return sortConfig.direction === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    }
    return 0;
  });

  const filteredResults = sortedResults.filter(result => {
    const assessment = assessments[result.assessmentId];
    const course = assessment ? courses[assessment.courseId] : null;
    const searchString = `${assessment?.title || ''} ${course?.title || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

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
    <div className="result-list-container">
      <div className="result-list-header">
        <div className="header-content">
          <h2>{userOnly ? 'My Results' : 'All Assessment Results'}</h2>
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      
      {filteredResults.length === 0 ? (
        <div className="no-results">
          <i className="bi bi-clipboard-x"></i>
          <p>No results found.</p>
        </div>
      ) : (
        <div className="results-grid">
          {filteredResults.map((result) => {
            const assessment = assessments[result.assessmentId];
            const course = assessment ? courses[assessment.courseId] : null;
            const passThreshold = 0.7;
            const scorePercentage = assessment ? (result.score / assessment.maxScore) : 0;
            const isPassed = scorePercentage >= passThreshold;
            
            return (
              <div className="result-card" key={result.resultId}>
                <div className="result-header">
                  <div className="result-title">
                    <h3>
                      {assessment ? (
                        <Link to={`/assessments/${assessment.assessmentId}`}>
                          {assessment.title}
                        </Link>
                      ) : (
                        'Unknown Assessment'
                      )}
                    </h3>
                    {course && (
                      <div className="course-tag">
                        <i className="bi bi-book"></i>
                        <Link to={`/courses/${course.courseId}`}>
                          {course.title}
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className={`status-badge ${isPassed ? 'passed' : 'failed'}`}>
                    <i className={`bi ${isPassed ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                    {isPassed ? 'Passed' : 'Failed'}
                  </div>
                </div>

                <div className="result-details">
                  <div className="score-section">
                    <div className="score-display">
                      <div className="score-circle" style={{
                        background: `conic-gradient(
                          ${isPassed ? '#2ecc71' : '#e74c3c'} ${scorePercentage * 360}deg,
                          #ecf0f1 ${scorePercentage * 360}deg
                        )`
                      }}>
                        <span>{Math.round(scorePercentage * 100)}%</span>
                      </div>
                    </div>
                    <div className="score-info">
                      <p className="score-text">
                        Score: {result.score} / {assessment?.maxScore}
                      </p>
                      <p className="threshold-text">
                        Passing Score: {Math.round(passThreshold * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="attempt-info">
                    <div className="attempt-date">
                      <i className="bi bi-calendar3"></i>
                      <span>{formatDate(result.attemptDate)}</span>
                    </div>
                    {!userOnly && (
                      <div className="student-info">
                        <i className="bi bi-person"></i>
                        <span>{currentUser?.name || 'Unknown User'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="result-actions">
                  <Link
                    to={`/assessments/${assessment?.assessmentId}`}
                    className="view-details-btn"
                  >
                    View Assessment Details
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultList;
