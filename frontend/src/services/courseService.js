import api from './api';

// Get all courses with optional filters
export const getCourses = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.issuer) params.append('issuer', filters.issuer);
    if (filters.level) params.append('level', filters.level);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/courses?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single course by ID
export const getCourse = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new course (admin only)
export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/courses', courseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update course (admin only)
export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete course (admin only)
export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update course status (admin only)
export const updateCourseStatus = async (id, status) => {
  try {
    const response = await api.patch(`/courses/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get courses by category
export const getCoursesByCategory = async (category) => {
  try {
    const response = await api.get(`/courses/category/${category}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get courses by issuer
export const getCoursesByIssuer = async (issuer) => {
  try {
    const response = await api.get(`/courses/issuer/${issuer}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get course statistics (admin only)
export const getCourseStats = async () => {
  try {
    const response = await api.get('/courses/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update expired courses (admin only)
export const updateExpiredCourses = async () => {
  try {
    const response = await api.post('/courses/admin/update-expired');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
