import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { getCategoryIcon, getCategoryColor, formatDate, formatEventType } from '../../utils/helpers';
import { useState } from 'react';

const EventCard = ({ event }) => {
  const { isAuthenticated, user } = useAuth();
  const { toggleFavorite } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const [localFavorite, setLocalFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle both MongoDB (_id) and Supabase (id) formats
  const eventId = event.id || event._id;

  // Decode HTML entities in image URL
  const getDecodedImage = () => {
    if (!event.image) return null;
    return event.image.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  };

  // Check if event is in user's favorites
  const isFavorite = localFavorite || user?.favorites?.some(fav =>
    (typeof fav === 'string' ? fav : fav.id || fav._id) === eventId
  );

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setIsLoading(true);
    try {
      const response = await toggleFavorite(eventId);
      setLocalFavorite(response.isFavorited);

      // Show success animation
      setTimeout(() => setIsLoading(false), 300);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      setIsLoading(false);
    }
  };

  const CategoryIcon = getCategoryIcon(event.category);
  const categoryColor = getCategoryColor(event.category);

  // Category-specific gradient backgrounds for events without images
  const getCategoryGradient = () => {
    const gradients = {
      'hackathon': 'from-purple-600 via-pink-600 to-red-600',
      'workshop': 'from-blue-600 via-cyan-600 to-teal-600',
      'networking': 'from-green-600 via-emerald-600 to-lime-600',
      'seminar': 'from-indigo-600 via-purple-600 to-pink-600',
      'tech-talk': 'from-cyan-600 via-blue-600 to-indigo-600',
      'coding-contest': 'from-orange-600 via-red-600 to-pink-600',
      'academic': 'from-blue-700 via-indigo-700 to-purple-700',
      'other': 'from-gray-600 via-gray-700 to-gray-800'
    };
    return gradients[event.category] || gradients['other'];
  };

  return (
    <Link to={`/events/${eventId}`} className="block h-full outline-none">
      <div className="bg-white dark:bg-slate-900 rounded-[14px] md:rounded-[16px] overflow-hidden group h-full flex flex-col border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all duration-300">
        {/* Image Section */}
        <div className={`relative h-[140px] sm:h-[180px] overflow-hidden shrink-0 ${event.image && !imageError ? '' : `bg-gradient-to-br ${getCategoryGradient()}`}`}>
          {event.image && !imageError ? (
            <img
              src={getDecodedImage()}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-4 group-hover:scale-110 transition-transform duration-300 border border-white/20">
                <CategoryIcon className="w-8 h-8 md:w-10 md:h-10 text-white/90" />
              </div>
            </div>
          )}

          {/* Deep Overlay for rich contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-900/30 to-transparent group-hover:from-gray-950/100 transition-colors duration-300" />

          {/* Category Badge - Bottom Left over gradient */}
          <div className="absolute bottom-3 left-3 flex items-center">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-[6px] text-[9px] md:text-[10px] font-bold text-white tracking-widest uppercase shadow-sm">
              {(event?.category || 'other').replace('-', ' ')}
            </span>
          </div>

          {/* Favorite Button - Top Right Sleek */}
          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md border transition-all duration-300 z-10 ${isFavorite
              ? 'bg-yellow-400 border-yellow-400 text-slate-900'
              : 'bg-black/20 border-white/20 text-white hover:bg-white/30'
              }`}
          >
            <Star className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? 'fill-current' : ''}`} strokeWidth={isFavorite ? 0 : 2} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-3 md:p-4 flex flex-col flex-grow bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative">

          {/* Title & Featured Row - Forced min-height to prevent staggering */}
          <div className="flex justify-between items-start mb-2 gap-2 min-h-[40px] md:min-h-[42px]">
            <h3 className="text-[14.5px] md:text-[16px] font-bold text-slate-900 dark:text-white leading-[1.3] line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {event.title}
            </h3>
            {event.featured && (
              <span className="px-2 py-0.5 rounded-[4px] bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black tracking-widest uppercase shrink-0 shadow-sm mt-0.5">
                HOT
              </span>
            )}
          </div>

          {/* Description - Tightened and forced min-height */}
          <p className="text-slate-500 dark:text-slate-400 text-[12px] md:text-[13px] leading-[1.4] line-clamp-2 mb-3 md:mb-4 flex-grow min-h-[34px] md:min-h-[36px]">
            {event.description || 'Join us for this exciting event! Tap to view more details.'}
          </p>

          {/* Date & Location - unified single row */}
          <div className="flex items-center gap-2 md:gap-3 text-[11px] md:text-[12px] font-semibold text-slate-600 dark:text-slate-400 mb-3 md:mb-4 truncate">
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
              <span className="truncate">{event?.date ? formatDate(event.date) : 'Date TBD'}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
              <span className="truncate">{event.city || 'Online'}</span>
            </div>
          </div>

          {/* Action Button - Minimalist Outlined Pill */}
          <div className="mt-auto pt-2.5 md:pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="w-full text-center py-2 text-[13px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-[8px] transition-colors">
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
