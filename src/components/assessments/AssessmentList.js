import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import assessmentService from '../../services/assessmentService';
import courseService from '../../services/courseService';
import authService from '../../services/authService';
import './AssessmentList.css';

const AssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const currentUser = authService.getCurrentUser();
  const isInstructor = currentUser?.role === 'Instructor';

  useEffect(() => {
    const fetchAssessmentsAndCourses = async () => {
      try {
        const assessmentData = await assessmentService.getAllAssessments();
        setAssessments(assessmentData);
        
        // Fetch all courses to get their titles
        const courseData = await courseService.getAllCourses();
        const courseMap = {};
        courseData.forEach(course => {
          courseMap[course.courseId] = course;
        });
        
        setCourses(courseMap);
      } catch (err) {
        setError('Failed to load assessments. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentsAndCourses();
  }, []);

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (courses[assessment.courseId]?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'course') return matchesSearch && assessment.courseId;
    if (filter === 'standalone') return matchesSearch && !assessment.courseId;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading assessments...</p>
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
    <div className="assessment-list-container">
      <div className="assessment-list-header">
        <div className="header-content">
          <h2>Assessments</h2>
          <div className="filters">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'course' ? 'active' : ''}`}
                onClick={() => setFilter('course')}
              >
                Course Assessments
              </button>
              <button
                className={`filter-btn ${filter === 'standalone' ? 'active' : ''}`}
                onClick={() => setFilter('standalone')}
              >
                Standalone Quizzes
              </button>
            </div>
          </div>
        </div>
        {isInstructor && (
          <Link to="/assessments/create" className="create-assessment-btn">
            <i className="bi bi-plus-lg"></i>
            Create Assessment
          </Link>
        )}
      </div>

      {filteredAssessments.length === 0 ? (
        <div className="no-assessments">
          <i className="bi bi-clipboard-x"></i>
          <p>No assessments found matching your criteria.</p>
        </div>
      ) : (
        <div className="assessment-grid">
          {filteredAssessments.map((assessment) => (
            <div className="assessment-card" key={assessment.assessmentId}>
              <div className="assessment-icon">
                <i className="bi bi-file-earmark-text"></i>
              </div>
              <div className="assessment-content">
                <h3>{assessment.title}</h3>
                {courses[assessment.courseId] && (
                  <div className="course-tag">
                    <i className="bi bi-book"></i>
                    <Link to={`/courses/${assessment.courseId}`}>
                      {courses[assessment.courseId].title}
                    </Link>
                  </div>
                )}
                <div className="assessment-meta">
                  <span className="score-badge">
                    <i className="bi bi-star-fill"></i>
                    Max Score: {assessment.maxScore}
                  </span>
                  <span className="time-badge">
                    <i className="bi bi-clock"></i>
                    {assessment.timeLimit || 'No time limit'}
                  </span>
                </div>
                <div className="assessment-actions">
                  <Link
                    to={`/assessments/${assessment.assessmentId}`}
                    className="primary-btn"
                  >
                    {currentUser?.role === 'Student' ? 'Take Quiz' : 'View Details'}
                  </Link>
                  {isInstructor && (
                    <Link
                      to={`/assessments/edit/${assessment.assessmentId}`}
                      className="secondary-btn"
                    >
                      <i className="bi bi-pencil"></i>
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
