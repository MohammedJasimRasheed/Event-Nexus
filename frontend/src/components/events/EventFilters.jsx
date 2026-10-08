import { useEffect, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CATEGORIES, EVENT_TYPES, CITIES } from '../../utils/constants';
import * as eventService from '../../services/eventService';

const normalizeCategoryValue = (rawValue = '') => {
  return rawValue
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const formatCategoryLabel = (rawValue = '') => {
  return rawValue
    .trim()
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const mergeCategoryOptions = (existingOptions, newValues) => {
  const optionMap = new Map(existingOptions.map(option => [option.value, option]));

  newValues.forEach(value => {
    const normalizedValue = normalizeCategoryValue(value);
    if (!normalizedValue || optionMap.has(normalizedValue)) {
      return;
    }

    optionMap.set(normalizedValue, {
      value: normalizedValue,
      label: formatCategoryLabel(value)
    });
  });

  return Array.from(optionMap.values());
};

const FilterScrollRow = ({ options, name, currentValue, onChange }) => (
  <div className="w-full">
    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-2 px-2 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
      {options.map((opt, idx) => {
        const val = typeof opt === 'string' ? opt : opt.value || opt;
        const lbl = typeof opt === 'string' ? opt : opt.label || opt;
        const isActive = currentValue === val;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onChange({ target: { name, value: val }})}
            className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 rounded-[8px] text-[11px] sm:text-[12px] font-bold transition-all active:scale-[0.97] border ${
              isActive 
                ? 'bg-gradient-to-r from-blue-600 to-slate-900 border-transparent text-white shadow-sm shadow-blue-900/20' 
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-gray-300 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {lbl}
          </button>
        )
      })}
    </div>
  </div>
);

const EventFilters = ({ filters, setFilters, onSearch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState(CATEGORIES);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await eventService.getCategories();
        const apiCategoryValues = Array.isArray(response?.data)
          ? response.data.map(category => category?._id || category?.category).filter(Boolean)
          : [];

        setCategoryOptions(prev => mergeCategoryOptions(prev, apiCategoryValues));
      } catch (error) {
        // Keep static fallback categories when API call fails.
        console.error('Failed to load dynamic categories for filters:', error);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      eventType: '',
      city: '',
      search: '',
      upcoming: 'true',
      sort: 'date',
      order: 'asc',
      limit: filters.limit || 12
    });
    onSearch();
  };

  const hasActiveFilters = filters.category || filters.eventType || filters.city || (filters.search && filters.search.length > 0);

  return (
    <div className="mb-6 relative z-20">
      {/* Sleek Minimal Glass Panel */}
      <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-white/50 dark:border-white/5 shadow-sm rounded-xl md:rounded-2xl -z-10 transition-all duration-300"></div>
      
      <div className="p-3 md:p-4 flex flex-col gap-3">
        {/* Compact Search Bar & Filters Header row */}
        <form onSubmit={handleSearchSubmit} className="w-full group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-5 h-5 transition-colors group-focus-within:text-primary-500" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search hackathons, coding contests, workshops..."
              className="w-full pl-11 pr-24 py-2.5 sm:py-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all text-sm sm:text-[15px] shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-slate-900 text-white px-4 py-1.5 sm:py-2 rounded-[8px] hover:opacity-90 hover:shadow-blue-900/20 transition-all shadow-md active:scale-[0.97] text-[13px] font-bold tracking-wide"
            >
              Search
            </button>
          </div>
        </form>

        {/* Primary Row: Categories & Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
           <div className="flex-grow overflow-hidden w-full">
             <FilterScrollRow
               name="category"
               currentValue={filters.category}
               onChange={handleChange}
               options={[{ value: '', label: '🔥 All Categories' }, ...categoryOptions]}
             />
           </div>
           
           <button
             onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
             className={`shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] sm:text-[12px] font-bold border transition-colors ${
               isMoreFiltersOpen 
                 ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white' 
                 : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800'
             }`}
           >
             <Filter className="w-3.5 h-3.5" />
             <span className="inline">{isMoreFiltersOpen ? 'Less Filters' : 'More Filters'}</span>
           </button>
        </div>

        {/* Expandable Secondary Row */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${isMoreFiltersOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0 m-0'}`}>
             <FilterScrollRow
               name="eventType"
               currentValue={filters.eventType}
               onChange={handleChange}
               options={[{ value: '', label: 'All Types' }, ...EVENT_TYPES.map(t => ({ value: (t.value || t), label: (t.label || t) }))]}
             />
             <FilterScrollRow
               name="city"
               currentValue={filters.city}
               onChange={handleChange}
               options={[{ value: '', label: 'Globally' }, ...CITIES.map(c => ({ value: c, label: c }))]}
             />
             <FilterScrollRow
               name="sort"
               currentValue={filters.sort}
               onChange={handleChange}
               options={[
                 { value: 'date', label: 'By Upcoming' },
                 { value: 'latest', label: 'Recently Added' },
                 { value: 'popular', label: 'Most Popular' },
                 { value: 'favorites', label: 'Top Trending' }
               ]}
             />
             <FilterScrollRow
               name="upcoming"
               currentValue={filters.upcoming}
               onChange={handleChange}
               options={[
                 { value: 'true', label: 'Upcoming Only' },
                 { value: '', label: 'All Time' }
               ]}
             />
        </div>

        {/* Active Filters & Reset Action */}
        {(hasActiveFilters || isMoreFiltersOpen) && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-3 border-t border-slate-100 dark:border-slate-700/50 mt-1">
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-[6px] text-[10px] font-black uppercase tracking-wider ring-1 ring-primary-500/20">
                  {filters.category.replace('-', ' ')}
                  <button onClick={() => setFilters(prev => ({ ...prev, category: '' }))} className="ml-1.5 hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.eventType && (
                <span className="inline-flex items-center px-2 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-[6px] text-[10px] font-black uppercase tracking-wider ring-1 ring-primary-500/20">
                  {filters.eventType}
                  <button onClick={() => setFilters(prev => ({ ...prev, eventType: '' }))} className="ml-1.5 hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.city && (
                <span className="inline-flex items-center px-2 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-[6px] text-[10px] font-black uppercase tracking-wider ring-1 ring-primary-500/20">
                  {filters.city}
                  <button onClick={() => setFilters(prev => ({ ...prev, city: '' }))} className="ml-1.5 hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {!hasActiveFilters && (
                <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500">No active filters applied</span>
              )}
            </div>
            
            {(hasActiveFilters) && (
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center space-x-1 transition-all px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[6px] active:scale-95 border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
              >
                <span>Reset All</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFilters;
