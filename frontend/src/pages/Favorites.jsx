import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, ArrowUp } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/events/EventCard';
import EventCardSkeleton from '../components/common/EventCardSkeleton';

const Favorites = () => {
  const { favorites, loading, fetchFavorites } = useEvents();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-transparent py-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500/10" />
            <span>Your Favorites</span>
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1 font-medium">Events you've saved for later</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {favorites.map((event) => (
              <EventCard key={event.id || event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">
              Start exploring events and save the ones you like!
            </p>
            <Link
              to="/events"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
            >
              <Calendar className="w-5 h-5" />
              <span>Browse Events</span>
            </Link>
          </div>
        )}
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

export default Favorites;
