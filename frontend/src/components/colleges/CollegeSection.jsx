import { Link } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, Calendar } from 'lucide-react';
import PropTypes from 'prop-types';
import { motion } from 'motion/react';

export const CollegeCard = ({ college }) => {
  return (
    <Link
      to={`/colleges/${college.id}/events`}
      className="group flex flex-col w-full aspect-[4/5] sm:aspect-auto glass-panel-premium rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* College Logo/Header */}
      <div className="relative h-28 sm:h-36 bg-[#020617] bg-[linear-gradient(110deg,_#3b82f6_0%,_#1e3a8a_25%,_#020617_60%),_radial-gradient(circle_at_90%_20%,_#8b5cf6_0%,_transparent_40%)] overflow-hidden flex-shrink-0">
        {college.logo ? (
          <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 bg-white/10 backdrop-blur-sm">
            <img
              src={college.logo}
              alt={college.name}
              className="max-h-24 max-w-full object-contain drop-shadow-2xl"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center border-b border-white/10">
            <Building2 className="w-16 h-16 text-white/80" strokeWidth={1} />
          </div>
        )}
        {/* Event Count Badge */}
        {college.event_count > 0 && (
          <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 glass-panel-premium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-lg">
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-900 dark:text-white leading-none">
                {college.event_count} <span className="hidden sm:inline">{college.event_count === 1 ? 'Event' : 'Events'}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* College Info */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-grow">
        {/* Short Name Badge */}
        {college.short_name && (
          <div className="hidden md:inline-block bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2.5 w-fit tracking-wide">
            {college.short_name}
          </div>
        )}

        {/* College Name */}
        <h3 className="text-[13px] sm:text-lg font-extrabold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 min-h-[1.75rem] sm:min-h-[2.75rem] leading-tight">
          {college.name}
        </h3>

        {/* Description */}
        {college.description && (
          <p className="hidden md:line-clamp-3 text-sm text-slate-600 dark:text-gray-400 mb-4 min-h-[3.75rem] leading-relaxed">
            {college.description}
          </p>
        )}

        {/* Location */}
        {college.location && (
          <div className="flex items-center text-slate-500 dark:text-gray-400 mb-1.5 sm:mb-4">
            <MapPin className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="text-[9px] sm:text-xs line-clamp-1">{college.location}</span>
          </div>
        )}

        {/* View Events Button */}
        <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-100 dark:border-white/10 mt-auto">
          <span className="text-[11px] sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
            View Events
          </span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

CollegeCard.propTypes = {
  college: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    short_name: PropTypes.string,
    logo: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.string,
    event_count: PropTypes.number
  }).isRequired
};

const CollegeSection = ({ colleges = [] }) => {
  if (!colleges || colleges.length === 0) {
    return null;
  }

  const displayedColleges = colleges.slice(0, 4);

  return (
    <section className="relative py-12 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900/10 dark:via-transparent dark:to-slate-900/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
          <div>
            <div className="flex items-center space-x-4 mb-3">
              <div className="h-8 lg:h-10 w-1 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-950 dark:text-white tracking-tight">
                College Internal Events
              </h2>
            </div>
            <p className="text-slate-600 dark:text-gray-400 ml-5 text-base font-medium">
              Explore events happening at your institution
            </p>
          </div>

          <Link
            to="/colleges"
            className="mt-6 lg:mt-0 ml-5 lg:ml-0 inline-flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
          >
            <span>View All Colleges</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Colleges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 items-stretch">
          {displayedColleges.map((college, index) => (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex"
            >
              <CollegeCard college={college} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

CollegeSection.propTypes = {
  colleges: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      short_name: PropTypes.string,
      logo: PropTypes.string,
      description: PropTypes.string,
      location: PropTypes.string,
      event_count: PropTypes.number
    })
  )
};

export default CollegeSection;
