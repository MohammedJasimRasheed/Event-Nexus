import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Calendar, ChevronDown, Navigation } from 'lucide-react';
import PropTypes from 'prop-types';
import ScrollVelocity from './ScrollVelocity';

const POPULAR_CITIES = [
  'Mangalore', 'Bangalore', 'Mysore', 'Hubli',
  'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Kochi'
];

const STORAGE_KEY = 'eventnexus_user_city';

const LocalEventsSection = ({ events = [], city = '', onCityChange, loading = false }) => {
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameRef = useRef(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const pickerRef = useRef(null);

  // Auto-scroll animation (same as FeaturedSection)
  useEffect(() => {
    if (isPaused || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollSpeed = 0.8;

    const autoScroll = () => {
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;

        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += scrollSpeed;
        }
      }
      animationFrameRef.current = requestAnimationFrame(autoScroll);
    };

    animationFrameRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused]);

  // Close city picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowCityPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (selectedCity) => {
    onCityChange(selectedCity);
    setShowCityPicker(false);
    setCitySearch('');
  };

  const handleCitySearchSubmit = (e) => {
    e.preventDefault();
    if (citySearch.trim()) {
      handleCitySelect(citySearch.trim());
    }
  };

  const filteredCities = POPULAR_CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return { month: '', day: '' };
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return { month, day };
  };

  // Duplicate events for seamless infinite scroll
  const displayEvents = events.length > 0 ? [...events, ...events, ...events] : [];

  if (!city) {
    return (
      <section className="relative py-12 lg:py-20 bg-gradient-to-b from-white via-orange-50/30 to-white dark:from-slate-900/10 dark:via-orange-950/10 dark:to-slate-900/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-8 lg:h-10 w-1 bg-gradient-to-b from-orange-500 to-rose-500 rounded-full"></div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-950 dark:text-white tracking-tight">
              Local Events Near You
            </h2>
          </div>
          <div className="text-center py-12">
            <Navigation className="w-14 h-14 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Set your city to discover local events</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Find hackathons, club fests, tech meetups and more happening near you</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_CITIES.slice(0, 6).map(c => (
                <button
                  key={c}
                  onClick={() => handleCitySelect(c)}
                  className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 lg:py-20 bg-gradient-to-b from-white via-orange-50/30 to-white dark:from-slate-900/10 dark:via-orange-950/10 dark:to-slate-900/10 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
        {/* Header */}
        <div className="flex flex-col w-full mb-6 md:mb-12 lg:mb-16">
          {/* Mobile Header (Static) */}
          <div className="md:hidden flex flex-col mb-1">
            <div className="flex items-center mb-2">
              <div className="h-6 w-1 bg-orange-600 rounded-full mr-2"></div>
              <h2 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">Explore Events in Mangalore</h2>
            </div>
            <p className="text-[14px] font-semibold text-slate-700 dark:text-gray-300 ml-3 text-shadow-sm">
              Events happening near you
            </p>
          </div>

          {/* Desktop/Tablet Header (Animated) */}
          <div className="hidden md:block w-full">
            <ScrollVelocity
              texts={[`Events in ${city}`]}
              velocity={45}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-950 dark:text-white tracking-tighter"
            />
            <ScrollVelocity
              texts={[`Hackathons · Tech Meetups · Workshops · Club Fests happening near you`]}
              velocity={-45}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-gray-300 tracking-tight"
            />
          </div>
          {/* City selector */}
          <div className="mt-6 flex items-center gap-3" ref={pickerRef}>
            <div className="relative">
              <button
                onClick={() => setShowCityPicker(!showCityPicker)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl text-sm font-semibold hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-colors border border-orange-200 dark:border-orange-800"
              >
                <MapPin className="w-4 h-4" />
                {city}
                <ChevronDown className={`w-4 h-4 transition-transform ${showCityPicker ? 'rotate-180' : ''}`} />
              </button>
              {showCityPicker && (
                <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 w-64 max-h-72 overflow-hidden">
                  <form onSubmit={handleCitySearchSubmit} className="p-3 border-b border-gray-100 dark:border-slate-700">
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="Search or type a city..."
                      className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      autoFocus
                    />
                  </form>
                  <div className="max-h-52 overflow-y-auto">
                    {citySearch.trim() && !filteredCities.some(c => c.toLowerCase() === citySearch.trim().toLowerCase()) && (
                      <button
                        onClick={() => handleCitySelect(citySearch.trim())}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-slate-700 text-orange-600 dark:text-orange-400 font-medium border-b border-gray-100 dark:border-slate-700"
                      >
                        Search "{citySearch.trim()}"
                      </button>
                    )}
                    {filteredCities.map(c => (
                      <button
                        key={c}
                        onClick={() => handleCitySelect(c)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors ${c === city ? 'bg-orange-50 dark:bg-slate-700 text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link
              to={`/events?city=${encodeURIComponent(city)}`}
              className="text-sm text-orange-600 dark:text-orange-400 font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex gap-5 overflow-hidden pb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] h-[400px] rounded-[2rem] bg-gray-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-14 h-14 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No upcoming events in {city}</h3>
            <p className="text-gray-500 dark:text-gray-400">Check back later or try a different city</p>
          </div>
        )}

        {/* Events scroll container */}
        {!loading && events.length > 0 && (
          <div
            className="relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Scroll Buttons */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-gray-200"
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-gray-200"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>

            {/* Cards Container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-5 pb-6 hide-scrollbar"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {displayEvents.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] h-[400px]"
                >
                  <LocalEventCard event={item} formatDate={formatDate} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const LocalEventCard = ({ event, formatDate }) => {
  const eventDate = formatDate(event.date);

  return (
    <Link
      to={`/events/${event.id}`}
      className="block w-full h-full group"
      aria-label={`View details for ${event.title}`}
    >
      <div
        className="relative h-full glass-panel-premium rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-xl hover:scale-[1.02] hover:shadow-2xl"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105"
            style={{ transform: 'translateZ(0)' }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
        </div>

        {/* Category Badge */}
        {event.category && (
          <div className="absolute top-4 lg:top-5 left-4 lg:left-5 z-20">
            <span className="px-3 py-1.5 bg-orange-500/20 backdrop-blur-md text-white text-xs font-semibold tracking-wider rounded-lg border border-orange-300/30 uppercase shadow-md">
              {event.category.replace('-', ' ')}
            </span>
          </div>
        )}

        {/* Date Badge */}
        <div className="absolute top-4 lg:top-5 right-4 lg:right-5 glass-panel-premium rounded-xl p-3 text-center shadow-lg z-20 transition-transform duration-300 hover:scale-110">
          <div className="text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest mb-0.5">
            {eventDate.month}
          </div>
          <div className="text-black dark:text-white text-xl font-black leading-none">
            {eventDate.day}
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 z-20">
          <div className="space-y-3 lg:space-y-4">
            <h3 className="text-white text-xl lg:text-2xl font-bold leading-tight tracking-tight drop-shadow-md line-clamp-2 group-hover:text-orange-100 transition-colors duration-300">
              {event.title}
            </h3>

            <div className="flex flex-col gap-2 text-white/90 text-xs lg:text-sm font-medium">
              {event.venue && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <span className="line-clamp-1">{event.venue}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-3 border-t border-white/20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white font-bold text-xs tracking-wide flex items-center gap-1.5">
                DETAILS
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
              <div className="h-0.5 flex-1 mx-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

LocalEventCard.propTypes = {
  event: PropTypes.object.isRequired,
  formatDate: PropTypes.func.isRequired,
};

LocalEventsSection.propTypes = {
  events: PropTypes.array,
  city: PropTypes.string,
  onCityChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default LocalEventsSection;
