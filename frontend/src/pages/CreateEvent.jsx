import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Link as LinkIcon,
  Image,
  Tag,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Building2,
  Code,
  Star
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import * as collegeService from '../services/collegeService';
import * as eventService from '../services/eventService';
import IconSelect from '../components/common/IconSelect';
import { CATEGORIES, EVENT_TYPES, CITIES, INDIAN_STATES } from '../utils/constants';

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
      label: formatCategoryLabel(value),
      icon: 'Tag'
    });
  });

  return Array.from(optionMap.values());
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const { createEvent, loading } = useEvents();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [colleges, setColleges] = useState([]);
  const [isCollegeAdmin, setIsCollegeAdmin] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState(CATEGORIES);
  const [newCategory, setNewCategory] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    eventType: 'offline',
    image: '',
    date: {
      start: '',
      end: ''
    },
    registrationDeadline: '',
    time: {
      start: '',
      end: ''
    },
    location: {
      venue: '',
      address: '',
      city: '',
      state: ''
    },
    college: {
      name: ''
    },
    isInternalEvent: false,
    isTechnicalEvent: false,
    featured: false,
    collegeId: '',
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    registration: {
      required: true,
      link: '',
      fee: 0
    },
    tags: [],
    requirements: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isInternalEvent') {
      // When unchecking, clear collegeId and location fields
      if (!checked) {
        setFormData(prev => ({
          ...prev,
          isInternalEvent: false,
          collegeId: '',
          location: {
            venue: '',
            address: '',
            city: '',
            state: ''
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          isInternalEvent: checked
        }));
      }
    } else if (name === 'isTechnicalEvent') {
      setFormData(prev => ({
        ...prev,
        isTechnicalEvent: checked
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  useEffect(() => {
    // Fetch colleges list
    const loadInitialData = async () => {
      try {
        const [collegeResult, categoryResult] = await Promise.allSettled([
          collegeService.getColleges(),
          eventService.getCategories()
        ]);

        if (collegeResult.status === 'fulfilled') {
          setColleges(collegeResult.value.data || []);
        }

        if (categoryResult.status === 'fulfilled') {
          const apiCategoryValues = Array.isArray(categoryResult.value?.data)
            ? categoryResult.value.data.map(category => category?._id || category?.category).filter(Boolean)
            : [];

          setCategoryOptions(prev => mergeCategoryOptions(prev, apiCategoryValues));
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    loadInitialData();

    if (user?.college) {
      setIsCollegeAdmin(true);
    }
  }, [user]);

  const handleAddCustomCategory = () => {
    const normalizedValue = normalizeCategoryValue(newCategory);
    if (!normalizedValue) {
      return;
    }

    setCategoryOptions(prevOptions => {
      const existingOption = prevOptions.find(option => option.value === normalizedValue);

      if (existingOption) {
        return prevOptions;
      }

      return [
        ...prevOptions,
        {
          value: normalizedValue,
          label: formatCategoryLabel(newCategory),
          icon: 'Tag'
        }
      ];
    });

    setFormData(prev => ({
      ...prev,
      category: normalizedValue
    }));
    setNewCategory('');
  };

  // Auto-populate location when college is selected for internal events
  useEffect(() => {
    const fetchCollegeLocation = async () => {
      if (formData.isInternalEvent && formData.collegeId) {
        try {
          const response = await collegeService.getCollege(formData.collegeId);
          const college = response.data || response;
          
          // Auto-populate location fields with college data
          setFormData(prev => ({
            ...prev,
            location: {
              venue: college.name || prev.location.venue,
              address: college.location || prev.location.address,
              city: college.city || prev.location.city,
              state: college.state || prev.location.state
            }
          }));
        } catch (err) {
          console.error('Error fetching college details:', err);
        }
      }
    };

    fetchCollegeLocation();
  }, [formData.collegeId, formData.isInternalEvent]);

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (reqToRemove) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await createEvent(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your event has been submitted for approval. You'll be notified once it's reviewed.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submit New Event</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Share your event with the community</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., HackFest 2026 - National Level Hackathon"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder="Brief summary (max 200 characters)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Describe your event in detail..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <IconSelect
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={categoryOptions}
                    placeholder="Select Category"
                    required
                  />
                  {user?.role === 'admin' && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomCategory();
                          }
                        }}
                        placeholder="Add custom category"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCategory}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Event Type *
                  </label>
                  <IconSelect
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    options={EVENT_TYPES}
                    placeholder="Select Event Type"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Image className="w-4 h-4 inline mr-1" />
                  Event Image URL (optional)
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/event-image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              <Calendar className="w-5 h-5 inline mr-2" />
              Date & Time
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="date.start"
                  value={formData.date.start}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="date.end"
                  value={formData.date.end}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="time.start"
                  value={formData.time.start}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="time.end"
                  value={formData.time.end}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              <MapPin className="w-5 h-5 inline mr-2" />
              Location
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    required
                    list="city-options"
                    disabled={formData.isInternalEvent && formData.collegeId}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Select or type city"
                  />
                  <datalist id="city-options">
                    {CITIES.map(city => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    list="state-options"
                    disabled={formData.isInternalEvent && formData.collegeId}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Select or type state"
                  />
                  <datalist id="state-options">
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  name="location.venue"
                  value={formData.location.venue}
                  onChange={handleChange}
                  placeholder="e.g., Main Auditorium"
                  disabled={formData.isInternalEvent && formData.collegeId}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  placeholder="Complete address"
                  disabled={formData.isInternalEvent && formData.collegeId}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* College Internal Event Section */}
              <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="isInternalEvent"
                    name="isInternalEvent"
                    checked={formData.isInternalEvent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="isInternalEvent" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Mark as College Internal Event
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Check this if this event is specifically for students of a particular college/institution
                    </p>
                  </div>
                </div>

                {formData.isInternalEvent && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select College *
                    </label>
                    <select
                      name="collegeId"
                      value={formData.collegeId}
                      onChange={handleChange}
                      required={formData.isInternalEvent}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select College</option>
                      {colleges.map(college => (
                        <option key={college.id} value={college.id}>
                          {college.name} ({college.short_name})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This event will appear in the college's internal events section. Location will be filled automatically.
                    </p>
                  </div>
                )}
              </div>

              {/* Technical Event Section */}
              <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 mt-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="isTechnicalEvent"
                    name="isTechnicalEvent"
                    checked={formData.isTechnicalEvent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="isTechnicalEvent" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                      <Code className="w-4 h-4 inline mr-1" />
                      Mark as Technical Event
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Check this if this event involves technical competitions, coding, hackathons, or tech-related activities
                    </p>
                  </div>
                </div>
              </div>

              {/* Featured Event Section - Admin Only */}
              {user?.role === 'admin' && (
                <div className="border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 mt-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label htmlFor="featured" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                        <Star className="w-4 h-4 inline mr-1 text-yellow-500" />
                        Add as Featured Event
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Featured events are highlighted on the homepage and get more visibility
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Organizer Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  College/Organization Name (Optional)
                </label>
                <input
                  type="text"
                  name="college.name"
                  value={formData.college.name}
                  onChange={handleChange}
                  list="college-options"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Select or type college/organization"
                />
                <datalist id="college-options">
                  {colleges.map(college => (
                    <option
                      key={college.id}
                      value={college.name}
                      label={college.short_name ? `${college.name} (${college.short_name})` : college.name}
                    />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contact.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="contact.website"
                    value={formData.contact.website}
                    onChange={handleChange}
                    placeholder="https://event-website.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Registration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Registration Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    Registration Link
                  </label>
                  <input
                    type="url"
                    name="registration.link"
                    value={formData.registration.link}
                    onChange={handleChange}
                    placeholder="https://register.example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Registration Fee (₹)
                  </label>
                  <input
                    type="number"
                    name="registration.fee"
                    value={formData.registration.fee}
                    onChange={handleChange}
                    min="0"
                    placeholder="0 for free events"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              <Tag className="w-5 h-5 inline mr-2" />
              Tags & Requirements
            </h2>
            
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (helps in search)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-2">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requirements (what participants need)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="e.g., Laptop, Student ID"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">{req}</span>
                      <button type="button" onClick={() => removeRequirement(req)} className="text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
