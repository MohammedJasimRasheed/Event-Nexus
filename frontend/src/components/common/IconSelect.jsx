import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';

const IconSelect = ({
  options,
  value,
  onChange,
  name,
  placeholder = 'Select...',
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const getIcon = (iconName) => {
    if (!iconName) return null;
    const Icon = Icons[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div ref={selectRef} className={`relative ${isOpen ? 'z-[60]' : 'z-10'} ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer flex items-center justify-between transition-all"
      >
        <div className="flex items-center space-x-2">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="text-primary-600 dark:text-primary-400">
                  {getIcon(selectedOption.icon)}
                </span>
              )}
              <span className="text-slate-900 dark:text-white font-medium">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-60 overflow-auto backdrop-blur-xl transition-all animate-fadeIn">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-3 cursor-pointer hover:bg-primary-50 dark:hover:bg-white/5 flex items-center space-x-3 transition-colors ${value === option.value ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-gray-200'
                }`}
            >
              {option.icon && (
                <span className={`${value === option.value ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-gray-400'}`}>
                  {getIcon(option.icon)}
                </span>
              )}
              <span className="font-medium">{option.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required
          className="absolute opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      )}
    </div>
  );
};

export default IconSelect;
