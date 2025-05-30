import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import authService from '../../services/authService';
import './CourseList.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = authService.getCurrentUser();
  const isInstructor = currentUser?.role === 'Instructor';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses();
        setCourses(data);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading courses...</p>
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
    <div className="course-list-container">
      <div className="course-list-header">
        <div className="header-content">
          <h2>Available Courses</h2>
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        {isInstructor && (
          <Link to="/courses/create" className="create-course-btn">
            <i className="bi bi-plus-lg"></i>
            Create New Course
          </Link>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="no-courses">
          <i className="bi bi-journal-x"></i>
          <p>No courses found matching your search.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div className="course-card" key={course.courseId}>
              <div className="course-image">
                {course.mediaUrl ? (
                  <img src={course.mediaUrl} alt={course.title} />
                ) : (
                  <div className="placeholder-image">
                    <i className="bi bi-journal-text"></i>
                  </div>
                )}
              </div>
              <div className="course-content">
                <h3>{course.title}</h3>
                <p>{course.description.length > 120
                  ? `${course.description.substring(0, 120)}...`
                  : course.description}</p>
                <div className="course-meta">
                  <span className="course-duration">
                    <i className="bi bi-clock"></i>
                    {course.duration || 'Self-paced'}
                  </span>
                  <span className="course-level">
                    <i className="bi bi-bar-chart"></i>
                    {course.level || 'All Levels'}
                  </span>
                </div>
                <Link to={`/courses/${course.courseId}`} className="view-course-btn">
                  View Course
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
