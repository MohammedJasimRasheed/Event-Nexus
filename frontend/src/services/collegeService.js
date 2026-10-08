import api from './api';

// Get all colleges
export const getColleges = async (params = {}) => {
  const response = await api.get('/colleges', { params });
  return response.data;
};

// Get colleges with event counts
export const getCollegesWithEvents = async () => {
  const response = await api.get('/colleges/with-events');
  return response.data;
};

// Get single college
export const getCollege = async (id) => {
  const response = await api.get(`/colleges/${id}`);
  return response.data;
};

// Get college events
export const getCollegeEvents = async (id, params = {}) => {
  const response = await api.get(`/colleges/${id}/events`, { params });
  return response.data;
};

// Create college (admin only)
export const createCollege = async (collegeData) => {
  const response = await api.post('/colleges', collegeData);
  return response.data;
};

// Update college (admin only)
export const updateCollege = async (id, collegeData) => {
  const response = await api.put(`/colleges/${id}`, collegeData);
  return response.data;
};

// Delete college (admin only)
export const deleteCollege = async (id) => {
  const response = await api.delete(`/colleges/${id}`);
  return response.data;
};
