import { useState, useEffect } from 'react';
import { Gift, ExternalLink, Sparkles, Search, ArrowUp } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import * as resourceService from '../services/resourceService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FreeResources = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    fetchResources();
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

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getResources({ status: 'active' });
      setResources(response.data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesTab = activeTab === 'all' || resource.category.toLowerCase().replace(/\s+/g, '-') === activeTab;

    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'free-stuff', label: 'Free Stuff' },
    { id: 'fellowships', label: 'Fellowships' }
  ];

  const getTagColor = (tag) => {
    const tagColors = {
      'NEW': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30',
      'AI': 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/30',
      'Free for Students': 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-500/30',
      'Fellowship': 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/30',
      'Development': 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30',
      'Cloud': 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
      'Design': 'bg-pink-100 dark:bg-pink-500/20 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-500/30',
      'Open Source': 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-500/30',
    };
    return tagColors[tag] || 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-gray-400 border-slate-300 dark:border-white/10';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pt-20 pb-12 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            <h1 className="text-4xl font-bold text-slate-950 dark:text-white">
              Free Stuff for College Builders
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-gray-400 ml-13 font-medium">
            Discover premium tools, resources, and opportunities available for free to students
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-5 h-5 icon-transition" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-white/5 text-slate-950 dark:text-white shadow-sm placeholder-slate-400 dark:placeholder-gray-600"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl inline-flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === tab.id
                  ? 'bg-white dark:bg-white/10 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Table */}
        <div className="glass-panel overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 font-bold text-slate-700 dark:text-gray-300 text-xs uppercase tracking-widest">
            <div className="col-span-3 flex items-center">Resource</div>
            <div className="col-span-1 flex items-center justify-center">Value</div>
            <div className="col-span-2 flex items-center">Tags</div>
            <div className="col-span-5 flex items-center">Description</div>
            <div className="col-span-1 flex items-center justify-end">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredResources.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Gift className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4 icon-float" />
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">No Resources Found</h3>
                <p className="text-slate-600 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search term' : 'No resources available in this category'}
                </p>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-300 border-l-4 border-transparent hover:border-primary-500 group hover:shadow-lg"
                >
                  {/* Resource Name */}
                  <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-white dark:bg-white/10 rounded-xl p-2 border border-slate-200 dark:border-white/10 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={resource.icon}
                        alt={resource.name}
                        className="max-w-full max-h-full object-contain icon-transition"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48?text=Icon';
                        }}
                      />
                    </div>
                    <span className="font-bold text-slate-950 dark:text-white text-sm leading-tight">{resource.name}</span>
                  </div>

                  {/* Value */}
                  <div className="col-span-12 md:col-span-1 flex items-center justify-center">
                    {resource.value && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-lg font-bold text-xs whitespace-nowrap border border-green-500/20">
                        {resource.value}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="col-span-12 md:col-span-2 flex items-center">
                    <div className="flex flex-wrap gap-1.5">
                      {resource.tags && resource.tags.length > 0 ? (
                        resource.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-span-12 md:col-span-5 flex items-center">
                    <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">{resource.description}</p>
                  </div>

                  {/* Apply Button */}
                  <div className="col-span-12 md:col-span-1 flex items-center justify-end">
                    <a
                      href={resource.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-1.5 bg-slate-900 dark:bg-blue-600 text-white rounded font-bold text-xs hover:bg-slate-800 dark:hover:bg-blue-500 transition-all hover:scale-105 gap-1.5 whitespace-nowrap group shadow-lg shadow-blue-500/10"
                    >
                      Apply Now
                      <ExternalLink className="w-3 h-3 icon-transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 glass-panel-premium p-6 border-primary-500/20">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1 icon-pulse-glow" />
            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                Pro Tip for Students
              </h3>
              <p className="text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                Take advantage of these resources early! Most require a valid student email (.edu) or enrollment verification.
                Bookmark this page and check back regularly as we add new resources and opportunities for college builders.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-24 md:bottom-8 right-6 md:right-8 p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 hover:scale-110 border-2 border-white dark:border-white/20 z-[9999] ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default FreeResources;
