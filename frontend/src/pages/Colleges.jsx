import { useEffect, useState } from 'react';
import { Search, Building2, AlertCircle } from 'lucide-react';
import * as collegeService from '../services/collegeService';
import { CollegeCard } from '../components/colleges/CollegeSection';
import EventCardSkeleton from '../components/common/EventCardSkeleton';

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      try {
        const response = await collegeService.getCollegesWithEvents();
        console.log('🏛️ Colleges Page - Fetched:', response);
        setColleges(response?.data || response || []);
      } catch (err) {
        console.error('❌ Error fetching colleges:', err);
        setError('Failed to load colleges. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (college.short_name && college.short_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (college.location && college.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-transparent py-8 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-white mb-2">
            Participating Colleges
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Explore internal events and opportunities at legendary institutions
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
            placeholder="Search colleges by name, short name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Colleges Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredColleges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredColleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Building2 className="w-20 h-20 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">No colleges found</h3>
            <p className="text-slate-600 dark:text-gray-400 mb-6 font-medium">Try a different search term</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary-600 font-medium hover:text-primary-700 underline underline-offset-4"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;
