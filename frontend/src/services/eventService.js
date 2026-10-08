import api from './api';

// Get all events with filters
export const getEvents = async (params = {}) => {
  const response = await api.get('/events', { params });
  return response.data;
};

// Get single event
export const getEvent = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

// Create event
export const createEvent = async (eventData) => {
  const response = await api.post('/events', eventData);
  return response.data;
};

// Update event
export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/events/${id}`, eventData);
  return response.data;
};

// Delete event
export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

// Toggle favorite
export const toggleFavorite = async (id) => {
  const response = await api.post(`/events/${id}/favorite`);
  return response.data;
};

// Get user favorites
export const getFavorites = async () => {
  const response = await api.get('/events/favorites');
  return response.data;
};

// Get user's submitted events
export const getMyEvents = async () => {
  const response = await api.get('/events/my-events');
  return response.data;
};

// Get categories
export const getCategories = async () => {
  const response = await api.get('/events/categories');
  return response.data;
};

// Update event status (admin only)
export const updateEventStatus = async (id, status, reason = '') => {
  const response = await api.put(`/events/${id}/status`, { status, reason });
  return response.data;
};

// Get local events by city
export const getLocalEvents = async (city, limit = 20) => {
  const response = await api.get('/events/local', { params: { city, limit } });
  return response.data;
};

// Toggle featured status (admin only)
export const toggleFeatured = async (id) => {
  const response = await api.put(`/events/${id}/featured`);
  return response.data;
};
