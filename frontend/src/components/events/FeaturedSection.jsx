import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Calendar } from 'lucide-react';
import PropTypes from 'prop-types';
import { motion } from 'motion/react';
import ScrollVelocity from './ScrollVelocity';

const lusionEasing = [0.25, 0.1, 0.25, 1.0];
const slowEasing = [0.19, 1.0, 0.22, 1.0];

const FeaturedSection = ({ events = [] }) => {
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameRef = useRef(null);

  // Optimized auto-scroll using requestAnimationFrame with delta-time for consistent speed
  useEffect(() => {
    if (isPaused || !scrollContainerRef.current || events.length === 0) return;

    const container = scrollContainerRef.current;
    let lastTimestamp = performance.now();
    const scrollSpeed = 50; // pixels per second for frame-independent speed

    const autoScroll = (timestamp) => {
      if (!container) return;

      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Calculate new scroll position
      const moveAmount = scrollSpeed * deltaTime;
      container.scrollLeft += moveAmount;

      // Seamless loop logic
      const { scrollLeft, scrollWidth, clientWidth } = container;
      // When we've scrolled past the first set of duplicated items, jump back to maintain "infinite" feel
      // We have [events, events, events]. Total width is 3 * singleSetWidth.
      const singleSetWidth = scrollWidth / 3;

      if (scrollLeft >= singleSetWidth * 2) {
        container.scrollLeft = scrollLeft - singleSetWidth;
      }

      animationFrameRef.current = requestAnimationFrame(autoScroll);
    };

    animationFrameRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, events.length]);

  if (!events || events.length === 0) {
    return (
      <section className="py-12 lg:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/10 dark:via-transparent dark:to-slate-900/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-1 w-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full"></div>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">Featured Events</h2>
              </div>
              <p className="text-gray-500 ml-20 text-lg">No featured events available at the moment</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Duplicate events for seamless infinite scroll
  const displayEvents = events.length > 0 ? [...events, ...events, ...events] : [];

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

  return (
    <section className="relative py-12 lg:py-20 bg-slate-50 dark:bg-transparent overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
        {/* Header */}
        <div className="flex flex-col w-full mb-6 md:mb-12 lg:mb-16">
          {/* Mobile Header (Static) */}
          <div className="md:hidden flex items-center">
            <div className="h-6 w-1 bg-primary-600 rounded-full mr-2"></div>
            <h2 className="text-[18px] font-medium text-slate-900 dark:text-white">Featured</h2>
          </div>

          {/* Desktop/Tablet Header (Animated) */}
          <div className="hidden md:block w-full">
            <ScrollVelocity
              texts={['Featured']}
              velocity={45}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-950 dark:text-white tracking-tighter"
            />
            <ScrollVelocity
              texts={['Discover Opportunities handpicked for you']}
              velocity={-45}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-gray-300 tracking-tight"
            />
          </div>
        </div>


        {/* Horizontal Scroll Container */}
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
            className="flex overflow-x-auto gap-4 md:gap-5 pb-6 hide-scrollbar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {displayEvents.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex-shrink-0 w-[260px] md:w-[320px] lg:w-[360px] h-[380px] md:h-[400px] snap-start"
              >
                <EventCard event={item} formatDate={formatDate} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section >
  );
};

const EventCard = ({ event, formatDate }) => {
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
        {/* Image with parallax effect */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
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
            <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-semibold tracking-wider rounded-lg border border-white/20 uppercase shadow-md">
              {event.category.replace('-', ' ')}
            </span>
          </div>
        )}

        {/* Date Badge */}
        <div className="absolute top-4 lg:top-5 right-4 lg:right-5 glass-panel-premium rounded-xl p-3 text-center shadow-lg z-20 transition-transform duration-300 hover:scale-110">
          <div className="text-indigo-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-0.5">
            {eventDate.month}
          </div>
          <div className="text-black dark:text-white text-xl font-black leading-none">
            {eventDate.day}
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 z-20">
          <div className="space-y-3 lg:space-y-4">
            {/* Title */}
            <h3 className="text-white text-xl lg:text-2xl font-bold leading-tight tracking-tight drop-shadow-md line-clamp-2 group-hover:text-primary-100 transition-colors duration-300">
              {event.title}
            </h3>

            {/* Meta Information */}
            <div className="flex flex-col gap-2 text-white/90 text-xs lg:text-sm font-medium">
              {event.venue && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-secondary-400 flex-shrink-0" />
                  <span className="line-clamp-1">{event.venue}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-secondary-400" />
                <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-3 border-t border-white/20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white font-bold text-xs tracking-wide flex items-center gap-1.5">
                DETAILS
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
              <div className="h-0.5 flex-1 mx-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-400 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
  formatDate: PropTypes.func.isRequired,
};

FeaturedSection.propTypes = {
  events: PropTypes.array,
};

export default FeaturedSection;
