import { createContext, useContext, useState, useCallback } from 'react';
import * as eventService from '../services/eventService';
import { useAuth } from './AuthContext';

const EventContext = createContext();

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [filters, setFilters] = useState({
    category: '',
    eventType: '',
    city: '',
    search: '',
    upcoming: '',
    sort: 'created_at',
    order: 'desc',
    limit: 50
  });

  const fetchEvents = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedParams = { ...filters, ...params };
      const response = await eventService.getEvents(mergedParams);
      setEvents(response.data);
      setPagination({
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.currentPage
      });
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchEvent = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEvent(id);
      setCurrentEvent(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch event');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.createEvent(eventData);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (eventId) => {
    try {
      const response = await eventService.toggleFavorite(eventId);
      
      // Update events list
      setEvents(prev => prev.map(event => {
        if ((event.id || event._id) === eventId) {
          return {
            ...event,
            favoritesCount: response.isFavorited 
              ? (event.favoritesCount || 0) + 1 
              : Math.max((event.favoritesCount || 0) - 1, 0)
          };
        }
        return event;
      }));
      
      // Update current event if viewing detail page
      if (currentEvent && (currentEvent.id || currentEvent._id) === eventId) {
        setCurrentEvent(prev => ({
          ...prev,
          favoritesCount: response.isFavorited 
            ? (prev.favoritesCount || 0) + 1 
            : Math.max((prev.favoritesCount || 0) - 1, 0)
        }));
      }
      
      return response;
    } catch (err) {
      throw err;
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await eventService.getFavorites();
      setFavorites(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch favorites');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getMyEvents();
      setMyEvents(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your events');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const value = {
    events,
    currentEvent,
    favorites,
    myEvents,
    loading,
    error,
    pagination,
    filters,
    fetchEvents,
    fetchEvent,
    createEvent,
    toggleFavorite,
    fetchFavorites,
    fetchMyEvents,
    updateFilters,
    setFilters
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
