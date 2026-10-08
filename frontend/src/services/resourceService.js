import api from './api';

// Get all resources with optional filters
export const getResources = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/resources?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single resource by ID
export const getResource = async (id) => {
  try {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new resource (admin only)
export const createResource = async (resourceData) => {
  try {
    const response = await api.post('/resources', resourceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update resource (admin only)
export const updateResource = async (id, resourceData) => {
  try {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete resource (admin only)
export const deleteResource = async (id) => {
  try {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update resource status (admin only)
export const updateResourceStatus = async (id, status) => {
  try {
    const response = await api.patch(`/resources/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get resource statistics (admin only)
export const getResourceStats = async () => {
  try {
    const response = await api.get('/resources/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
