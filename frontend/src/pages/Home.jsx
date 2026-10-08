
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  ArrowUp,
  Code,
  Trophy,
  BookOpen,
  Laptop,
  Music,
  Mic,
  Monitor,
  Rocket,
  Globe,
  Lightbulb
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/events/EventCard';
import EventCardSkeleton from '../components/common/EventCardSkeleton';
import FeaturedSection from '../components/events/FeaturedSection';
import LocalEventsSection from '../components/events/LocalEventsSection';
import CollegeSection from '../components/colleges/CollegeSection';
import LightRays from '../components/common/LightRays';
import { CATEGORIES } from '../utils/constants';
import * as collegeService from '../services/collegeService';
import * as eventService from '../services/eventService';

const Home = () => {
  const { events, loading, fetchEvents } = useEvents();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [localCity, setLocalCity] = useState(() => localStorage.getItem('eventnexus_user_city') || 'Mangalore');
  const [localEvents, setLocalEvents] = useState([]);
  const [localEventsLoading, setLocalEventsLoading] = useState(false);

  useEffect(() => {
    // Fetch all events including featured ones
    const loadEvents = async () => {
      setFeaturedLoading(true);
      try {
        const response = await fetchEvents({ limit: 50, sort: 'created_at', order: 'desc' });
        console.log('📊 Fetched events:', response?.data?.length, response?.data);
      } catch (error) {
        console.error('❌ Error fetching events:', error);
      }
      setFeaturedLoading(false);
    };

    loadEvents();
  }, []);

  useEffect(() => {
    // Fetch colleges with event counts
    const loadColleges = async () => {
      setCollegesLoading(true);
      try {
        const response = await collegeService.getCollegesWithEvents();
        console.log('🏫 Fetched colleges:', response?.data);

        // Sort colleges to put "Srinivas" first
        const sortedColleges = (response?.data || []).sort((a, b) => {
          const aIsSrinivas = a.name.toLowerCase().includes('srinivas');
          const bIsSrinivas = b.name.toLowerCase().includes('srinivas');
          if (aIsSrinivas && !bIsSrinivas) return -1;
          if (!aIsSrinivas && bIsSrinivas) return 1;
          return 0;
        });

        setColleges(sortedColleges);
      } catch (error) {
        console.error('❌ Error fetching colleges:', error);
        setColleges([]);
      }
      setCollegesLoading(false);
    };

    loadColleges();
  }, []);

  // Fetch local events when city changes
  useEffect(() => {
    const loadLocalEvents = async () => {
      if (!localCity) {
        setLocalEvents([]);
        return;
      }
      setLocalEventsLoading(true);
      try {
        const response = await eventService.getLocalEvents(localCity, 20);
        console.log(`📍 Local events in ${localCity}:`, response?.data?.length);
        setLocalEvents(response?.data || []);
      } catch (error) {
        console.error('❌ Error fetching local events:', error);
        setLocalEvents([]);
      }
      setLocalEventsLoading(false);
    };

    loadLocalEvents();
  }, [localCity]);

  const handleCityChange = (newCity) => {
    setLocalCity(newCity);
    localStorage.setItem('eventnexus_user_city', newCity);
  };

  useEffect(() => {
    console.log('🔍 Processing events:', events.length, events);
    // Separate featured and upcoming events
    const featured = events.filter(event => event.featured === true);
    // Cap at exactly 8 to create exactly two symmetrical rows on desktop (4x2)
    const upcoming = events.filter(event => !event.featured).slice(0, 8);

    console.log('⭐ Featured events:', featured.length, featured);
    console.log('📅 Upcoming events:', upcoming.length, upcoming);

    setFeaturedEvents(featured);
    setUpcomingEvents(upcoming.length > 0 ? upcoming : events.slice(0, 8));
  }, [events]);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPos = window.scrollY + window.innerHeight;
      const threshold = scrollHeight - 800; // Show when nearing the bottom/footer
      setShowBackToTop(scrollPos > threshold && window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryIcons = {
    'hackathon': Laptop,
    'coding-contest': Code,
    'workshop': BookOpen,
    'seminar': Mic,
    'tech-talk': Monitor,
    'cultural': Music
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pt-64 pb-12 lg:py-20 overflow-hidden">
        {/* LightRays Background */}
        <div className="absolute inset-0 w-full h-full">
          <LightRays
            raysOrigin="top-center"
            raysColor="#818cf8"
            raysSpeed={1}
            lightSpread={0.5}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            className="w-full h-full"
            pulsating={false}
            fadeDistance={1}
            saturation={1}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mt-12 md:mt-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 animate-fadeIn leading-tight">
              <span className="text-white block mb-2 scale-110 origin-center drop-shadow-md">EventNexus</span>
              <span className="block text-yellow-300 drop-shadow-sm">Discover Amazing Events</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fadeIn">
              Your gateway to hackathons, coding contests, workshops, and campus events.
              Never miss an opportunity to learn, compete, and grow!
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 animate-fadeIn">
              <Link to="/events?category=hackathon" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Hackathons
              </Link>
              <Link to="/events?category=coding-contest" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                <Laptop className="w-4 h-4" />
                Coding Contests
              </Link>
              <Link to="/events?category=workshop" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Workshops
              </Link>
              <Link to="/events?eventType=online" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Online Events
              </Link>
              <Link to="/courses" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Courses
              </Link>
              <Link to="/free-resources" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Resources
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Section with Horizontal Scrolling */}
      {featuredLoading ? (
        <div className="py-12 bg-slate-50 dark:bg-slate-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full"></div>
              <h2 className="text-4xl font-bold text-gray-900">Featured</h2>
            </div>
            <div className="flex space-x-6 overflow-hidden">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex-shrink-0 w-[340px] sm:w-[380px]">
                  <EventCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <FeaturedSection events={featuredEvents} />
      )}

      {/* College Internal Events Section */}
      {!collegesLoading && colleges.length > 0 && (
        <CollegeSection colleges={colleges} />
      )}

      {/* Local Events Section (city-based) */}
      <LocalEventsSection
        events={localEvents}
        city={localCity}
        onCityChange={handleCityChange}
        loading={localEventsLoading}
      />
      <section className="py-10 md:py-14 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-[20px] md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2 md:mb-4">
              Explore by Category
            </h2>
            <p className="text-[13px] md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Find the perfect event that matches your interests and goals
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-y-6 md:gap-y-8 gap-x-2 sm:gap-x-6 md:gap-x-8 max-w-fit mx-auto justify-items-center">
            {CATEGORIES.slice(0, 6).map((category, index) => {
              const Icon = categoryIcons[category.value] || Calendar;
              return (
                <Link
                  key={category.value}
                  to={`/events?category=${category.value}`}
                  className="flex flex-col items-center group cursor-pointer w-[90px] md:w-[120px] outline-none"
                >
                  <div className="w-[64px] h-[64px] md:w-[84px] md:h-[84px] rounded-full bg-[#f3f4f6] dark:bg-slate-800/80 flex items-center justify-center mb-3 transition-colors duration-200 group-active:scale-95 group-hover:bg-[#e5e7eb] dark:group-hover:bg-slate-700">
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-slate-800 dark:text-gray-200" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[12.5px] md:text-[14.5px] font-semibold text-slate-800 dark:text-white text-center leading-tight">
                    {category.label}
                  </h3>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* Featured Events */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-white mb-2">
                Upcoming Events
              </h2>
              <p className="text-slate-600 dark:text-gray-400">Don't miss these exciting opportunities</p>
            </div>
            <Link
              to="/events"
              className="hidden md:flex items-center space-x-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              <span>View All Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {[...Array(8)].map((_, index) => (
                <EventCardSkeleton key={index} />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id || event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500">Check back later for upcoming events!</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/events"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md shadow-blue-900/20 active:scale-95"
            >
              <span>View All Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hidden md:block py-10 bg-gradient-to-r from-blue-600 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Have an Event to Share?
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Help fellow students discover amazing opportunities. Submit your college event
            and reach thousands of students across the country!
          </p>
          <Link
            to="/create-event"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-100 transition-all shadow-lg group"
          >
            <span>Submit Your Event</span>
            <ArrowRight className="w-5 h-5 icon-transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 md:bottom-8 right-6 md:right-8 p-3 bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-full shadow-2xl hover:opacity-90 transition-all duration-300 hover:scale-[1.15] border border-white/20 group z-[9999] ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-6 h-6 icon-transition group-hover:-translate-y-1" />
      </button>
    </div>
  );
};

export default Home;

