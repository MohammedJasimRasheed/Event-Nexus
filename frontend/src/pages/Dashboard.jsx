import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import {
  Calendar,
  Heart,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, getDaysUntil } from '../utils/helpers';
import { STATUS_COLORS } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const { myEvents, favorites, loading, fetchMyEvents, fetchFavorites } = useEvents();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    fetchMyEvents();
    fetchFavorites();
  }, []);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPos = window.scrollY + window.innerHeight;
      const threshold = scrollHeight - 600;
      setShowBackToTop(scrollPos > threshold && window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    {
      icon: Calendar,
      label: 'Events Submitted',
      value: myEvents.length,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Heart,
      label: 'Favorites',
      value: favorites.length,
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: CheckCircle,
      label: 'Approved',
      value: myEvents.filter(e => e.status === 'approved').length,
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Clock,
      label: 'Pending',
      value: myEvents.filter(e => e.status === 'pending').length,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Here's what's happening with your events</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="glass-panel-premium p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-950 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/create-event"
            className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all card-hover"
          >
            <PlusCircle className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Submit New Event</h3>
            <p className="text-primary-100 text-sm">Share your event with the community</p>
          </Link>

          <Link
            to="/events"
            className="glass-panel group border-2 border-slate-200 dark:border-white/5 p-6 hover:shadow-xl transition-all card-hover"
          >
            <Calendar className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-1">Browse Events</h3>
            <p className="text-slate-600 dark:text-gray-400 text-sm">Discover new opportunities</p>
          </Link>

          <Link
            to="/favorites"
            className="glass-panel group border-2 border-slate-200 dark:border-white/5 p-6 hover:shadow-xl transition-all card-hover"
          >
            <Heart className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-1">Your Favorites</h3>
            <p className="text-slate-600 dark:text-gray-400 text-sm">View saved events</p>
          </Link>
        </div>

        {/* My Events */}
        <div className="glass-panel-premium p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">My Events</h2>
            <Link to="/create-event" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              + Add Event
            </Link>
          </div>

          {myEvents.length > 0 ? (
            <div className="space-y-4">
              {myEvents.slice(0, 5).map((event) => (
                <Link
                  key={event.id || event._id}
                  to={`/events/${event.id || event._id}`}
                  className="block p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-slate-950 dark:text-white">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[event.status]}`}>
                          {event.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </span>
                        <span>{event.city}</span>
                        <span>{event.views} views</span>
                      </div>
                    </div>
                    {getStatusIcon(event.status)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No events yet</h3>
              <p className="text-gray-500 mb-4">Start by submitting your first event!</p>
              <Link
                to="/create-event"
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Submit Event</span>
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Favorite Events */}
        <div className="glass-panel-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Upcoming Favorites</h2>
            <Link to="/favorites" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              View All
            </Link>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.slice(0, 4).map((event) => (
                <Link
                  key={event.id || event._id}
                  to={`/events/${event.id || event._id}`}
                  className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow-lg transition-all"
                >
                  <h3 className="font-bold text-slate-950 dark:text-white mb-2">{event.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-gray-400 font-medium">{formatDate(event.date)}</span>
                    <span className="text-primary-600 dark:text-primary-400 font-bold">{getDaysUntil(event.date)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No favorite events yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 md:bottom-8 right-6 md:right-8 p-3 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 border-2 border-white z-[9999] ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Dashboard;
