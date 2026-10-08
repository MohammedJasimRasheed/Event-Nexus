import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, AlertCircle, ArrowUp } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import EventCardSkeleton from '../components/common/EventCardSkeleton';

const Events = () => {
  const [searchParams] = useSearchParams();
  const { events, loading, error, pagination, fetchEvents, filters, setFilters } = useEvents();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get('category') || '',
    eventType: searchParams.get('eventType') || '',
    city: searchParams.get('city') || '',
    search: searchParams.get('search') || '',
    upcoming: '',
    sort: 'date',
    order: 'asc',
    limit: 12
  });

  useEffect(() => {
    // Sync local filters with URL params and fetch events
    const currentParams = {
      category: searchParams.get('category') || '',
      eventType: searchParams.get('eventType') || '',
      city: searchParams.get('city') || '',
      search: searchParams.get('search') || '',
      upcoming: searchParams.get('upcoming') || '',
      sort: searchParams.get('sort') || 'date',
      order: searchParams.get('order') || 'asc',
      limit: parseInt(searchParams.get('limit')) || 12
    };
    setLocalFilters(currentParams);
    fetchEvents(currentParams);
  }, [searchParams]);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPos = window.scrollY + window.innerHeight;
      const threshold = scrollHeight - 600; // Nearing the bottom
      setShowBackToTop(scrollPos > threshold && window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    fetchEvents(localFilters);
  };

  const handlePageChange = (page) => {
    fetchEvents({ ...localFilters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-transparent pt-2 pb-6 sm:py-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-white mb-2">
            Browse Events
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Discover hackathons, coding contests, workshops, and more
          </p>
        </div>

        {/* Filters */}
        <EventFilters
          filters={localFilters}
          setFilters={setLocalFilters}
          onSearch={handleSearch}
        />

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 sm:mb-6 text-slate-600 dark:text-gray-400 font-medium text-sm sm:text-base">
            Found <span className="font-bold text-slate-950 dark:text-white">{pagination.total}</span> events
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {[...Array(9)].map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {events.map((event) => (
                <EventCard key={event.id || event._id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>

                  {[...Array(Math.max(0, parseInt(pagination.totalPages) || 0))].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg font-bold transition-all ${pagination.currentPage === page
                            ? 'bg-gradient-to-r from-blue-600 to-slate-900 border-transparent text-white shadow-lg shadow-blue-900/20'
                            : 'border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-sm'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === pagination.currentPage - 2 ||
                      page === pagination.currentPage + 2
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-20 h-20 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">No events found</h3>
            <p className="text-slate-600 dark:text-gray-400 mb-6 font-medium">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setLocalFilters({
                  category: '',
                  eventType: '',
                  city: '',
                  search: '',
                  upcoming: '',
                  sort: 'created_at',
                  order: 'desc',
                  limit: 50
                });
                fetchEvents({ upcoming: '', sort: 'created_at', order: 'desc', limit: 50 });
              }}
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-24 md:bottom-8 right-6 md:right-8 p-3 bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-full shadow-2xl hover:opacity-90 transition-all duration-300 hover:scale-[1.15] border border-white/20 z-[9999] ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Events;
