import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';
import courseService from '../services/courseService';
import assessmentService from '../services/assessmentService';
import resultService from '../services/resultService';
import { useAuth } from '../utils/AuthContext';
import Loading from '../components/common/Loading';
import '../styles/Dashboard.css';

const styles = {
  cardHover: {
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    }
  },
  animatedBar: {
    animation: 'growWidth 1s ease-out'
  },
  chartContainer: {
    transition: 'all 0.3s ease'
  }
};

const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    recentCourses: [],
    featuredCourses: [],
    recentResults: [],
    assessmentStats: {
      total: 0,
      completed: 0,
      avgScore: 0,
      highestScore: 0,
      lowestScore: 100,
      recentPerformance: [],
      courseProgress: {},
      categoryPerformance: {}
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isStudent, isInstructor, loading: authLoading } = useAuth();

  const isAuth = useMemo(() => isAuthenticated(), [isAuthenticated]);

  useEffect(() => {
    if (authLoading || !isAuth) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [courses, assessments, results] = await Promise.all([
          courseService.getAllCourses(),
          assessmentService.getAllAssessments(),
          resultService.getAllResults()
        ]);
        
        const recentCourses = courses.slice(0, 4);
        const randomizedCourses = [...courses]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        let userResults = results;
        let stats = {
          total: 0,
          completed: 0,
          avgScore: 0,
          highestScore: 0,
          lowestScore: 100,
          recentPerformance: [],
          courseProgress: {},
          categoryPerformance: {}
        };

        if (currentUser && isStudent()) {
          userResults = results.filter(r => r.userId === currentUser.userId)
            .sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate));
          
          const recentResults = userResults.slice(0, 5);
          const totalAssessments = assessments.length;
          const completedAssessments = new Set(userResults.map(r => r.assessmentId)).size;
          
          let totalScore = 0;
          let highestScore = 0;
          let lowestScore = 100;
          let courseProgress = {};
          let categoryPerformance = {};
          
          // Calculate course progress
          courses.forEach(course => {
            const courseAssessments = assessments.filter(a => a.courseId === course.id);
            const completedCourseAssessments = userResults.filter(r => 
              courseAssessments.some(ca => ca.id === r.assessmentId)
            );
            
            courseProgress[course.id] = {
              title: course.title,
              total: courseAssessments.length,
              completed: completedCourseAssessments.length,
              avgScore: completedCourseAssessments.reduce((acc, curr) => acc + curr.score, 0) / 
                       (completedCourseAssessments.length || 1)
            };
          });

          // Calculate category performance
          assessments.forEach(assessment => {
            if (!categoryPerformance[assessment.category]) {
              categoryPerformance[assessment.category] = {
                total: 0,
                completed: 0,
                totalScore: 0
              };
            }
            
            categoryPerformance[assessment.category].total++;
            const userResult = userResults.find(r => r.assessmentId === assessment.id);
            if (userResult) {
              categoryPerformance[assessment.category].completed++;
              categoryPerformance[assessment.category].totalScore += userResult.score;
            }
          });

          // Calculate overall statistics
          userResults.forEach(result => {
            totalScore += result.score;
            highestScore = Math.max(highestScore, result.score);
            lowestScore = Math.min(lowestScore, result.score);
          });
          
          stats = {
            total: totalAssessments,
            completed: completedAssessments,
            avgScore: Math.round(totalScore / (userResults.length || 1)),
            highestScore,
            lowestScore,
            recentPerformance: recentResults,
            courseProgress,
            categoryPerformance
          };
        }

        setDashboardData({
          recentCourses,
          featuredCourses: randomizedCourses,
          recentResults: userResults,
          assessmentStats: stats
        });
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, isStudent, isAuth, authLoading]);

  if (authLoading) {
    return <Loading fullScreen message="Initializing EduSync..." />;
  }

  if (!isAuth) {
    return (
      <div className="container-fluid px-0">
        <div className="bg-primary text-white py-5" style={{
          background: 'linear-gradient(135deg, #4e54c8, #8f94fb)',
          minHeight: '500px'
        }}>
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-5 mb-lg-0">
                <h1 className="display-3 fw-bold mb-4">Welcome to EduSync</h1>
                <p className="lead mb-4 fs-4">
                  A comprehensive learning management system that helps students master new skills and instructors deliver effective educational content.
                </p>
                <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                  <Link to="/login" className="btn btn-light btn-lg px-4 me-md-2 fw-medium">
                    <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                  </Link>
                  <Link to="/register" className="btn btn-outline-light btn-lg px-4 fw-medium">
                    <i className="bi bi-person-plus me-2"></i> Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  const { recentCourses, featuredCourses, recentResults, assessmentStats } = dashboardData;

  const StatisticsOverview = ({ stats }) => {
    const cards = [
      {
        title: 'Total Assessments',
        value: stats.total,
        icon: 'bi-journal-text',
        color: '#4F46E5', // Deep Indigo
        bgColor: '#EEF2FF',
        description: 'Available assessments'
      },
      {
        title: 'Completed',
        value: stats.completed,
        icon: 'bi-check2-circle',
        color: '#059669', // Deep Emerald
        bgColor: '#ECFDF5',
        description: 'Finished assessments'
      },
      {
        title: 'Average Score',
        value: `${stats.avgScore}%`,
        icon: 'bi-graph-up',
        color: '#B45309', // Deep Amber
        bgColor: '#FFFBEB',
        description: 'Overall performance'
      },
      {
        title: 'Completion Rate',
        value: `${Math.round((stats.completed / stats.total) * 100)}%`,
        icon: 'bi-trophy',
        color: '#1D4ED8', // Deep Blue
        bgColor: '#EFF6FF',
        description: 'Progress rate'
      }
    ];

    return (
      <div className="row g-4 mb-4">
        {cards.map((card, index) => (
          <div key={index} className="col-md-3 col-sm-6">
            <div className="enhanced-stat-card h-100" style={{ backgroundColor: card.bgColor }}>
              <div className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: `${card.color}15` }}>
                    <i className={`bi ${card.icon}`} style={{ color: card.color }}></i>
                  </div>
                  <div className="ms-3">
                    <h3 className="stat-value mb-0" style={{ color: '#111827' }}>{card.value}</h3>
                    <p className="stat-description mb-0" style={{ color: card.color }}>{card.description}</p>
                  </div>
                </div>
                <h6 className="stat-title mb-0" style={{ color: '#374151' }}>{card.title}</h6>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const QuickActions = () => {
    const actions = [
      {
        title: 'Start Learning',
        description: 'Access your course materials',
        icon: 'bi-collection-play',
        link: '/courses',
        color: '#4F46E5', // Deep Indigo
        bgColor: '#EEF2FF'
      },
      {
        title: 'Take Assessment',
        description: 'Test your knowledge',
        icon: 'bi-pencil-square',
        link: '/assessments',
        color: '#059669', // Deep Emerald
        bgColor: '#ECFDF5'
      },
      {
        title: 'View Progress',
        description: 'Track your achievements',
        icon: 'bi-bar-chart',
        link: '/progress',
        color: '#1D4ED8', // Deep Blue
        bgColor: '#EFF6FF'
      }
    ];

    return (
      <div className="enhanced-card shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="section-title mb-4">
            <i className="bi bi-lightning-charge-fill me-2" style={{ color: '#4F46E5' }}></i>
            Quick Actions
          </h5>
          <div className="row g-4">
            {actions.map((action, index) => (
              <div key={index} className="col-md-4">
                <Link 
                  to={action.link} 
                  className="enhanced-action-link h-100"
                  style={{ backgroundColor: action.bgColor }}
                >
                  <div className="p-4">
                    <div className="action-icon-wrapper mb-3" style={{ backgroundColor: `${action.color}15` }}>
                      <i className={`bi ${action.icon}`} style={{ color: action.color }}></i>
                    </div>
                    <h6 className="action-title mb-2" style={{ color: '#111827' }}>{action.title}</h6>
                    <p className="action-description mb-0" style={{ color: '#6B7280' }}>{action.description}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const RecentAssessments = ({ results }) => {
    return (
      <div className="enhanced-card shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="section-title">
              <i className="bi bi-clock-history me-2" style={{ color: '#4F46E5' }}></i>
              Recent Assessments
            </h5>
            <Link to="/assessments" className="enhanced-btn-outline">
              View All <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
          <div className="table-responsive">
            <table className="enhanced-table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 5).map((result) => (
                  <tr key={result.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="enhanced-assessment-icon" 
                             style={{ 
                               backgroundColor: result.score >= 70 ? '#ECFDF5' : '#FFFBEB',
                               color: result.score >= 70 ? '#059669' : '#B45309'
                             }}>
                          <i className="bi bi-file-text"></i>
                        </div>
                        <div className="ms-3">
                          <p className="assessment-title mb-0">{result.assessmentTitle}</p>
                          <small className="assessment-category">{result.category}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`enhanced-score-badge ${result.score >= 70 ? 'success' : 'warning'}`}>
                        {result.score}%
                      </span>
                    </td>
                    <td>
                      <span className={`enhanced-status-badge ${result.score >= 70 ? 'success' : 'warning'}`}>
                        {result.score >= 70 ? 'Passed' : 'Needs Review'}
                      </span>
                    </td>
                    <td>
                      <span className="assessment-date">
                        {new Date(result.attemptDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <Link to={`/results/${result.id}`} className="enhanced-btn-view">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container mb-4">
        <div className="row align-items-center bg-white p-4 rounded-3 shadow-sm">
          <div className="col-md-8">
            <h2 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>
              <i className="bi bi-speedometer2 me-2 text-primary"></i>
              Dashboard Overview
            </h2>
            <p className="text-muted mb-0">
              Welcome back, <span className="fw-medium text-primary">{currentUser?.name}</span>
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            {isInstructor() ? (
              <div className="btn-group shadow-sm">
                <Link to="/courses/create" className="btn btn-primary px-4">
                  <i className="bi bi-plus-circle me-2"></i>New Course
                </Link>
                <Link to="/assessments/create" className="btn btn-outline-primary px-4">
                  <i className="bi bi-file-earmark-text me-2"></i>New Assessment
                </Link>
              </div>
            ) : (
              <Link to="/courses" className="btn btn-primary px-4 shadow-sm">
                <i className="bi bi-collection-play me-2"></i>Browse Courses
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="container mb-4">
          <div className="alert alert-danger d-flex align-items-center shadow-sm border-0" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </div>
        </div>
      )}
      
      <div className="container">
        {isStudent() && (
          <div className="dashboard-container">
            <div className="dashboard-welcome mb-4">
              <h4 className="welcome-title mb-2">Welcome back, <span className="text-primary">{currentUser?.name}</span></h4>
              <p className="welcome-subtitle mb-0">Track your learning progress and take assessments</p>
            </div>
            <StatisticsOverview stats={dashboardData.assessmentStats} />
            <QuickActions />
            <RecentAssessments results={dashboardData.assessmentStats.recentPerformance} />
          </div>
        )}
        
        {isInstructor() && (
          <div className="row mb-4 g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle p-3 bg-primary bg-opacity-10 me-3">
                      <i className="bi bi-journal-bookmark text-primary fs-4"></i>
                    </div>
                    <div>
                      <h5 className="card-title fw-bold mb-0" style={{ color: '#2c3e50' }}>Active Courses</h5>
                      <p className="text-muted small mb-0">Your teaching portfolio</p>
                    </div>
                  </div>
                  <h2 className="display-6 fw-bold mb-2" style={{ color: '#2c3e50' }}>
                    {recentCourses.length}
                  </h2>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="text-muted mb-0">Total active courses</p>
                    <Link to="/courses" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                      Manage All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle p-3 bg-warning bg-opacity-10 me-3">
                      <i className="bi bi-file-earmark-text text-warning fs-4"></i>
                    </div>
                    <div>
                      <h5 className="card-title fw-bold mb-0" style={{ color: '#2c3e50' }}>Assessments</h5>
                      <p className="text-muted small mb-0">Recent submissions</p>
                    </div>
                  </div>
                  <h2 className="display-6 fw-bold mb-2" style={{ color: '#2c3e50' }}>
                    {recentResults.length}
                  </h2>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="text-muted mb-0">Total submissions</p>
                    <Link to="/assessments" className="btn btn-sm btn-outline-warning rounded-pill px-3">
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle p-3 bg-success bg-opacity-10 me-3">
                      <i className="bi bi-lightning-charge text-success fs-4"></i>
                    </div>
                    <div>
                      <h5 className="card-title fw-bold mb-0" style={{ color: '#2c3e50' }}>Quick Actions</h5>
                      <p className="text-muted small mb-0">Manage your content</p>
                    </div>
                  </div>
                  <div className="d-grid gap-2 mt-3">
                    <Link to="/courses/create" className="btn btn-outline-success">
                      <i className="bi bi-plus-circle me-2"></i>Create New Course
                    </Link>
                    <Link to="/assessments/create" className="btn btn-outline-success">
                      <i className="bi bi-file-earmark-text me-2"></i>Create Assessment
                    </Link>
                    <Link to="/results" className="btn btn-outline-success">
                      <i className="bi bi-graph-up me-2"></i>View All Results
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;