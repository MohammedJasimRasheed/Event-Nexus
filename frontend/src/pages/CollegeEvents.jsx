import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Building2, Globe, Mail, Phone } from 'lucide-react';
import * as collegeService from '../services/collegeService';
import EventCard from '../components/events/EventCard';
import EventCardSkeleton from '../components/common/EventCardSkeleton';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CollegeEvents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCollegeData();
  }, [id]);

  const loadCollegeData = async () => {
    try {
      setLoading(true);
      setEventsLoading(true);

      // Fetch college details
      const collegeResponse = await collegeService.getCollege(id);
      setCollege(collegeResponse.data);
      setLoading(false);

      // Fetch college events
      const eventsResponse = await collegeService.getCollegeEvents(id, {
        upcoming: true,
        sort: 'date',
        order: 'asc'
      });
      setEvents(eventsResponse.data || []);
      setEventsLoading(false);
    } catch (err) {
      console.error('Error loading college data:', err);
      setError(err.message);
      setLoading(false);
      setEventsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">College Not Found</h2>
          <p className="text-gray-600 mb-6">The college you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Back Button */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* College Header */}
      <div className="relative overflow-hidden text-white py-8 lg:py-12">
        {/* Background Image with Blur */}
        {college.logo && (
          <div className="absolute inset-0">
            <img
              src={college.logo}
              alt={college.name}
              className="w-full h-full object-cover scale-110"
            />
            <div className="absolute inset-0 backdrop-blur-2xl bg-[#020617]/70 bg-[linear-gradient(110deg,_#3b82f6_0%,_#1e3a8a_30%,_#020617_70%),_radial-gradient(circle_at_90%_20%,_#8b5cf6_0%,_transparent_50%)]"></div>
          </div>
        )}
        {/* Fallback gradient if no logo */}
        {!college.logo && (
          <div className="absolute inset-0 bg-[#020617] bg-[linear-gradient(110deg,_#3b82f6_0%,_#1e3a8a_30%,_#020617_70%),_radial-gradient(circle_at_90%_20%,_#8b5cf6_0%,_transparent_50%)]"></div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-3xl">
            {college.short_name && (
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
                {college.short_name}
              </div>
            )}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 drop-shadow-lg">
              {college.name}
            </h1>
            {college.description && (
              <p className="text-lg text-white/90 mb-4 drop-shadow">
                {college.description}
              </p>
            )}

            {/* College Info */}
            <div className="flex flex-wrap gap-6 text-white/90">
              {college.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{college.location}</span>
                </div>
              )}
              {college.website && (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-white transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span>Website</span>
                </a>
              )}
              {college.contact_email && (
                <a
                  href={`mailto:${college.contact_email}`}
                  className="flex items-center space-x-2 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Contact</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upcoming Events
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Internal events organized by {college.short_name || college.name}
          </p>
        </div>

        {eventsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-panel-premium rounded-2xl">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-white mb-2">
              No Events Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              There are currently no upcoming events for this college.
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Check back later for new events!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeEvents;
