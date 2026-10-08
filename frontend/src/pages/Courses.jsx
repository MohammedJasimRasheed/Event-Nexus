import { useState, useEffect } from 'react';
import { BookOpen, Copy, ExternalLink, Star, Clock, Users, Search, Filter, Tag, TrendingUp, ArrowUp } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import * as courseService from '../services/courseService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Courses = () => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [categories, setCategories] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    fetchCourses();
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

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses({ status: 'active' });
      setCourses(response.data || []);

      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(c => c.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard!');
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pt-20 pb-12 flex items-center justify-center transition-colors duration-500">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Explore Courses</h1>
          <p className="mt-2 text-slate-600 dark:text-gray-400 font-medium">Enhance your skills with premium courses available for free.</p>
        </div>
        {/* Search and Filters */}
        <div className="glass-panel-premium p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-5 h-5 icon-transition" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-5 h-5 icon-transition" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category} className="dark:bg-slate-900">{category}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="">All Levels</option>
                <option value="Beginner" className="dark:bg-slate-900">Beginner</option>
                <option value="Intermediate" className="dark:bg-slate-900">Intermediate</option>
                <option value="Advanced" className="dark:bg-slate-900">Advanced</option>
                <option value="All Levels" className="dark:bg-slate-900">All Levels</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="glass-panel-premium p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">No Courses Found</h3>
            <p className="text-slate-600 dark:text-gray-400 font-medium">
              {searchTerm || selectedCategory || selectedLevel
                ? 'Try adjusting your filters'
                : 'Check back later for new courses!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="glass-panel-premium overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10 group flex flex-col h-full">
                {/* Course Image */}
                {course.image_url ? (
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {course.coupon_code && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                          100% OFF
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 gradient-bg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                <div className="p-3 flex flex-col flex-grow">
                  {/* Issuer Badge */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap text-bold">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-full">
                      {course.issuer}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-gray-400 text-[10px] font-bold rounded-full">
                      {course.level}
                    </span>
                    {course.category && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-[10px] font-bold rounded-full">
                        {course.category}
                      </span>
                    )}
                  </div>

                  {/* Course Title */}
                  <h3 className="text-base font-bold text-slate-950 dark:text-white mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {course.title}
                  </h3>

                  {/* Course Details */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-slate-500 dark:text-gray-400 font-bold">
                    {course.rating && (
                      <div className="flex items-center gap-1 group/item">
                        <Star className="w-3 h-3 text-yellow-500 fill-current icon-transition group-hover/item:scale-110" />
                        <span>{course.rating}</span>
                      </div>
                    )}
                    {course.duration && (
                      <div className="flex items-center gap-1 group/item">
                        <Clock className="w-3 h-3 text-primary-600 dark:text-primary-400 icon-transition group-hover/item:rotate-12" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    {course.enrolled_count > 0 && (
                      <div className="flex items-center gap-1 group/item">
                        <Users className="w-3 h-3 text-secondary-600 dark:text-secondary-400 icon-transition group-hover/item:scale-110" />
                        <span>{course.enrolled_count.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Spacer to push button down */}
                  <div className="flex-grow"></div>

                  {/* Coupon Code */}
                  {course.coupon_code && (
                    <div className="bg-green-500/10 dark:bg-green-500/5 border border-green-500/20 rounded p-2 mb-2 backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mb-0.5">
                            COUPON CODE
                          </p>
                          <p className="font-mono font-bold text-green-800 dark:text-green-300 text-sm truncate">
                            {course.coupon_code}
                          </p>
                        </div>
                        <button
                          onClick={() => copyCouponCode(course.coupon_code)}
                          className="p-1.5 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 transition-all flex-shrink-0 group/copy hover:scale-110"
                          title="Copy coupon code"
                        >
                          <Copy className="w-3.5 h-3.5 icon-transition group-hover/copy:icon-hover-bounce" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <a
                    href={course.course_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 gradient-bg text-white text-sm font-semibold rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-sm group mt-auto"
                  >
                    <ExternalLink className="w-4 h-4 icon-transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    Enroll Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-24 md:bottom-8 right-6 md:right-8 p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 hover:scale-110 border-2 border-white dark:border-white/20 z-[9999] ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6 icon-transition group-hover:-translate-y-1" />
        </button>
      </div>
    </div>
  );
};
export default Courses;

