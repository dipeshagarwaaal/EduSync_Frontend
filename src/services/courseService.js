import apiClient from './apiClient';

// Base API URL - change this to your backend API URL
const API_BASE_URL = 'https://localhost:7252';

const getAllCourses = async () => {
  // Direct API URL - customize this to match your backend API
  const url = `${API_BASE_URL}/api/Courses`;
  console.log('Fetching all courses from:', url);
  
  const response = await apiClient.get(url);
  return response.data;
};

const getCourseById = async (id) => {
  // Direct API URL - customize this to match your backend API
  const url = `${API_BASE_URL}/api/Courses/${id}`;
  console.log('Fetching course details from:', url);
  
  const response = await apiClient.get(url);
  return response.data;
};

const createCourse = async (courseData) => {
  // Direct API URL - customize this to match your backend API
  const url = `${API_BASE_URL}/api/Courses`;
  console.log('Creating course at:', url);
  
  // Option 1: Send data as-is (camelCase)
  const response = await apiClient.post(url, courseData);
  
  // Option 2: Format for ASP.NET Core API (PascalCase)
  // Uncomment this if your API expects PascalCase
  /*
  const response = await apiClient.post(url, {
    Title: courseData.title,
    Description: courseData.description,
    // Add other fields with PascalCase formatting
  });
  */
  
  return response.data;
};

const updateCourse = async (id, courseData) => {
  // Direct API URL - customize this to match your backend API
  const url = `${API_BASE_URL}/api/Courses/${id}`;
  console.log('Updating course at:', url);
  
  // Option 1: Send data as-is (camelCase)
  const response = await apiClient.put(url, courseData);
  
  // Option 2: Format for ASP.NET Core API (PascalCase)
  // Uncomment this if your API expects PascalCase
  /*
  const response = await apiClient.put(url, {
    Title: courseData.title,
    Description: courseData.description,
    // Add other fields with PascalCase formatting
  });
  */
  
  return response.data;
};

const deleteCourse = async (id) => {
  // Direct API URL - customize this to match your backend API
  const url = `${API_BASE_URL}/api/Courses/${id}`;
  console.log('Deleting course at:', url);
  
  const response = await apiClient.delete(url);
  return response.data;
};

// New methods for progress tracking
const getStudentProgress = async (studentId, courseId) => {
  const url = `${API_BASE_URL}/api/CourseProgress/${studentId}/${courseId}`;
  console.log('Fetching student progress from:', url);
  
  const response = await apiClient.get(url);
  return response.data;
};

const getAllStudentProgress = async (studentId) => {
  const url = `${API_BASE_URL}/api/CourseProgress/${studentId}`;
  console.log('Fetching all progress for student from:', url);
  
  const response = await apiClient.get(url);
  return response.data;
};

const updateCourseProgress = async (studentId, courseId, progressData) => {
  const url = `${API_BASE_URL}/api/CourseProgress/${studentId}/${courseId}`;
  console.log('Updating course progress at:', url);
  
  const response = await apiClient.put(url, {
    completionPercentage: progressData.completionPercentage,
    lastAccessedDate: new Date().toISOString(),
    currentModule: progressData.currentModule,
    completedModules: progressData.completedModules,
    status: progressData.status // e.g., "In Progress", "Completed", "Not Started"
  });
  
  return response.data;
};

const createCourseProgress = async (studentId, courseId) => {
  const url = `${API_BASE_URL}/api/CourseProgress`;
  console.log('Creating course progress at:', url);
  
  const response = await apiClient.post(url, {
    studentId,
    courseId,
    completionPercentage: 0,
    startDate: new Date().toISOString(),
    lastAccessedDate: new Date().toISOString(),
    currentModule: 1,
    completedModules: [],
    status: "Not Started"
  });
  
  return response.data;
};

const courseService = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getStudentProgress,
  getAllStudentProgress,
  updateCourseProgress,
  createCourseProgress
};

export default courseService;
