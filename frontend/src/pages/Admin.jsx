import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import * as eventService from '../services/eventService';
import * as courseService from '../services/courseService';
import * as resourceService from '../services/resourceService';
import * as collegeService from '../services/collegeService';
import { CheckCircle, XCircle, Clock, Calendar, MapPin, Users, AlertCircle, MessageSquare, BookOpen, Plus, Edit2, Trash2, Copy, ExternalLink, Tag, X, Gift, ArrowUp, Building2, Star } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const mouseDownRef = useRef(null);
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'courses', 'resources', or 'colleges'
  const [eventSubTab, setEventSubTab] = useState('pending'); // 'pending' or 'scraped'
  const [pendingEvents, setPendingEvents] = useState([]);
  const [scrapedEvents, setScrapedEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    issuer: '',
    instructor: '',
    category: '',
    level: 'Beginner',
    duration: '',
    original_price: 0,
    discount_percentage: 100,
    coupon_code: '',
    course_url: '',
    image_url: '',
    rating: '',
    enrolled_count: 0,
    language: 'English',
    expiry_date: '',
    status: 'active'
  });
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceFormData, setResourceFormData] = useState({
    name: '',
    description: '',
    value: '',
    category: 'free-stuff',
    tags: '',
    apply_url: '',
    icon: '',
    status: 'active'
  });
  const [colleges, setColleges] = useState([]);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [collegeFormData, setCollegeFormData] = useState({
    name: '',
    short_name: '',
    logo: '',
    description: '',
    location: '',
    city: '',
    state: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    established_year: '',
    affiliated_to: '',
    status: 'active'
  });
  // Event edit modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '', description: '', category: '', eventType: '', image: '',
    dateStart: '', dateEnd: '', registrationDeadline: '',
    venue: '', city: '', collegeName: '',
    registrationLink: '', registrationFee: 0,
    tags: '', requirements: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPendingEvents();
    fetchScrapedEvents();
    fetchCourses();
    fetchResources();
    fetchColleges();
  }, [user, navigate]);

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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showCourseModal || showRejectModal || showResourceModal || showCollegeModal || showEventModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCourseModal, showRejectModal, showResourceModal, showCollegeModal]);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({ status: 'pending' });
      setPendingEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching pending events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScrapedEvents = async () => {
    try {
      setLoading(true);
      // Fetch approved events (scraped events have status='approved' and no organizer_id)
      const response = await eventService.getEvents({ status: 'approved', limit: 100 });
      // Filter to show only scraped events (those without organizer_id or with college as source)
      const scraped = (response.data || []).filter(event =>
        !event.organizer_id || ['MLH', 'Devfolio', 'Eventbrite', 'GDG', 'Meetup'].includes(event.college)
      );
      setScrapedEvents(scraped);
    } catch (error) {
      console.error('Error fetching scraped events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScrapedEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setProcessing(eventId);
      await eventService.deleteEvent(eventId);

      // Remove from scraped list
      setScrapedEvents(prev => prev.filter(event => event.id !== eventId));

      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleFeatured = async (eventId, eventTitle, currentFeatured) => {
    try {
      setProcessing(eventId);
      const response = await eventService.toggleFeatured(eventId);
      const newFeatured = response.data?.featured ?? !currentFeatured;

      // Update in both lists
      setScrapedEvents(prev =>
        prev.map(event =>
          event.id === eventId ? { ...event, featured: newFeatured } : event
        )
      );
      setPendingEvents(prev =>
        prev.map(event =>
          event.id === eventId ? { ...event, featured: newFeatured } : event
        )
      );

      toast.success(newFeatured ? `"${eventTitle}" marked as featured!` : `"${eventTitle}" removed from featured.`);
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle featured status');
    } finally {
      setProcessing(null);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseService.getCourses({ includeAll: true });
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleApproval = async (eventId, status, reason = '') => {
    try {
      setProcessing(eventId);
      await eventService.updateEventStatus(eventId, status, reason);

      // Remove from pending list
      setPendingEvents(prev => prev.filter(event => event.id !== eventId));

      if (status === 'approved') {
        toast.success('✅ Event approved successfully! Event is now live on the browse page.');
      } else {
        toast.success('Event rejected. Organizer has been notified.');
      }

      // Close modal if open
      setShowRejectModal(false);
      setSelectedEvent(null);
      setRejectionReason('');

      // Refresh pending events list
      await fetchPendingEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error(error.response?.data?.message || 'Failed to update event status');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (event) => {
    setSelectedEvent(event);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedEvent(null);
    setRejectionReason('');
  };

  const handleRejectSubmit = () => {
    if (selectedEvent) {
      handleApproval(selectedEvent.id, 'rejected', rejectionReason);
    }
  };

  // Course Management Functions
  const openCourseModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseFormData({
        title: course.title || '',
        description: course.description || '',
        issuer: course.issuer || '',
        instructor: course.instructor || '',
        category: course.category || '',
        level: course.level || 'Beginner',
        duration: course.duration || '',
        original_price: course.original_price || 0,
        discount_percentage: course.discount_percentage || 100,
        coupon_code: course.coupon_code || '',
        course_url: course.course_url || '',
        image_url: course.image_url || '',
        rating: course.rating || '',
        enrolled_count: course.enrolled_count || 0,
        language: course.language || 'English',
        expiry_date: course.expiry_date ? new Date(course.expiry_date).toISOString().slice(0, 10) : '',
        status: course.status || 'active'
      });
    } else {
      setEditingCourse(null);
      setCourseFormData({
        title: '',
        description: '',
        issuer: '',
        instructor: '',
        category: '',
        level: 'Beginner',
        duration: '',
        original_price: 0,
        discount_percentage: 100,
        coupon_code: '',
        course_url: '',
        image_url: '',
        rating: '',
        enrolled_count: 0,
        language: 'English',
        expiry_date: '',
        status: 'active'
      });
    }
    setShowCourseModal(true);
  };

  const closeCourseModal = () => {
    setShowCourseModal(false);
    setEditingCourse(null);
    setCourseFormData({
      title: '',
      description: '',
      issuer: '',
      instructor: '',
      category: '',
      level: 'Beginner',
      duration: '',
      original_price: 0,
      discount_percentage: 100,
      coupon_code: '',
      course_url: '',
      image_url: '',
      rating: '',
      enrolled_count: 0,
      language: 'English',
      expiry_date: '',
      status: 'active'
    });
  };

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    setCourseFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up data - convert empty strings to null for optional fields
      const cleanedData = {
        ...courseFormData,
        expiry_date: courseFormData.expiry_date || null,
        coupon_code: courseFormData.coupon_code || null,
        image_url: courseFormData.image_url || null,
        rating: courseFormData.rating || null,
      };

      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, cleanedData);
        toast.success('Course updated successfully!');
      } else {
        await courseService.createCourse(cleanedData);
        toast.success('Course added successfully!');
      }
      closeCourseModal();
      await fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await courseService.deleteCourse(courseId);
      toast.success('Course deleted successfully!');
      await fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.message || 'Failed to delete course');
    }
  };

  const handleToggleCourseStatus = async (courseId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await courseService.updateCourseStatus(courseId, newStatus);
      toast.success(`Course ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      await fetchCourses();
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error(error.message || 'Failed to update course status');
    }
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard!');
  };

  // Event Edit Functions (Admin)
  const openEventModal = (event) => {
    setEditingEvent(event);
    const safeDate = (val) => {
      if (!val) return '';
      try { return new Date(val).toISOString().slice(0, 16); } catch { return ''; }
    };
    setEventFormData({
      title: event.title || '',
      description: event.description || '',
      category: event.category || '',
      eventType: event.event_type || '',
      image: event.image || '',
      dateStart: safeDate(event.date),
      dateEnd: safeDate(event.end_date),
      registrationDeadline: safeDate(event.registration_deadline),
      venue: event.venue || '',
      city: event.city || '',
      collegeName: event.college || '',
      registrationLink: event.registration_link || '',
      registrationFee: event.registration_fee ?? 0,
      tags: Array.isArray(event.tags) ? event.tags.join(', ') : (event.tags || ''),
      requirements: Array.isArray(event.requirements) ? event.requirements.join(', ') : (event.requirements || '')
    });
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      setProcessing(editingEvent.id);
      const submitData = {
        title: eventFormData.title,
        description: eventFormData.description,
        category: eventFormData.category,
        eventType: eventFormData.eventType,
        image: eventFormData.image || undefined,
        date: { start: eventFormData.dateStart || undefined, end: eventFormData.dateEnd || undefined },
        registrationDeadline: eventFormData.registrationDeadline || undefined,
        location: { venue: eventFormData.venue, city: eventFormData.city },
        college: { name: eventFormData.collegeName },
        registration: { link: eventFormData.registrationLink, fee: Number(eventFormData.registrationFee) },
        tags: eventFormData.tags ? eventFormData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        requirements: eventFormData.requirements ? eventFormData.requirements.split(',').map(r => r.trim()).filter(Boolean) : []
      };
      await eventService.updateEvent(editingEvent.id, submitData);
      toast.success('Event updated successfully!');
      closeEventModal();
      await fetchPendingEvents();
      await fetchScrapedEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setProcessing(null);
    }
  };

  // Resource Management Functions
  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getResources({ includeAll: true });
      setResources(response.data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  // College Management Functions
  const fetchColleges = async () => {
    try {
      const response = await collegeService.getColleges();
      setColleges(response.data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const handleAddCollege = () => {
    setEditingCollege(null);
    setCollegeFormData({
      name: '',
      short_name: '',
      logo: '',
      description: '',
      location: '',
      city: '',
      state: '',
      website: '',
      contact_email: '',
      contact_phone: '',
      established_year: '',
      affiliated_to: '',
      status: 'active'
    });
    setShowCollegeModal(true);
  };

  const handleEditCollege = (college) => {
    setEditingCollege(college);
    setCollegeFormData({
      name: college.name || '',
      short_name: college.short_name || '',
      logo: college.logo || '',
      description: college.description || '',
      location: college.location || '',
      city: college.city || '',
      state: college.state || '',
      website: college.website || '',
      contact_email: college.contact_email || '',
      contact_phone: college.contact_phone || '',
      established_year: college.established_year || '',
      affiliated_to: college.affiliated_to || '',
      status: college.status || 'active'
    });
    setShowCollegeModal(true);
  };

  const handleDeleteCollege = async (collegeId, collegeName) => {
    if (!window.confirm(`Are you sure you want to delete "${collegeName}"?\n\nThis will not delete the events associated with this college.`)) {
      return;
    }

    try {
      setProcessing(collegeId);
      await collegeService.deleteCollege(collegeId);
      await fetchColleges();
      toast.success('College deleted successfully!');
    } catch (error) {
      console.error('Error deleting college:', error);
      toast.error(error.response?.data?.message || 'Failed to delete college');
    } finally {
      setProcessing(null);
    }
  };

  const handleCollegeSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format data - convert empty strings to null and established_year to integer
      const formattedData = {
        name: collegeFormData.name,
        short_name: collegeFormData.short_name || null,
        logo: collegeFormData.logo || null,
        description: collegeFormData.description || null,
        location: collegeFormData.location || null,
        city: collegeFormData.city || null,
        state: collegeFormData.state || null,
        website: collegeFormData.website || null,
        contact_email: collegeFormData.contact_email || null,
        contact_phone: collegeFormData.contact_phone || null,
        established_year: collegeFormData.established_year ? parseInt(collegeFormData.established_year) : null,
        affiliated_to: collegeFormData.affiliated_to || null,
        status: collegeFormData.status
      };

      if (editingCollege) {
        await collegeService.updateCollege(editingCollege.id, formattedData);
        toast.success('College updated successfully!');
      } else {
        await collegeService.createCollege(formattedData);
        toast.success('College created successfully!');
      }

      setShowCollegeModal(false);
      setEditingCollege(null);
      setCollegeFormData({
        name: '',
        short_name: '',
        logo: '',
        description: '',
        location: '',
        city: '',
        state: '',
        website: '',
        contact_email: '',
        contact_phone: '',
        established_year: '',
        affiliated_to: '',
        status: 'active'
      });
      await fetchColleges();
    } catch (error) {
      console.error('Error saving college:', error);
      toast.error(error.response?.data?.message || 'Failed to save college');
    }
  };

  const openResourceModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setResourceFormData({
        name: resource.name || '',
        description: resource.description || '',
        value: resource.value || '',
        category: resource.category || 'free-stuff',
        tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : '',
        apply_url: resource.apply_url || '',
        icon: resource.icon || '',
        status: resource.status || 'active'
      });
    } else {
      setEditingResource(null);
      setResourceFormData({
        name: '',
        description: '',
        value: '',
        category: 'free-stuff',
        tags: '',
        apply_url: '',
        icon: '',
        status: 'active'
      });
    }
    setShowResourceModal(true);
  };

  const closeResourceModal = () => {
    setShowResourceModal(false);
    setEditingResource(null);
    setResourceFormData({
      name: '',
      description: '',
      value: '',
      category: 'free-stuff',
      tags: '',
      apply_url: '',
      icon: '',
      status: 'active'
    });
  };

  const handleResourceFormChange = (e) => {
    const { name, value } = e.target;
    setResourceFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert tags string to array
      const tagsArray = resourceFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const dataToSubmit = {
        ...resourceFormData,
        tags: tagsArray
      };

      if (editingResource) {
        await resourceService.updateResource(editingResource.id, dataToSubmit);
        toast.success('Resource updated successfully!');
      } else {
        await resourceService.createResource(dataToSubmit);
        toast.success('Resource added successfully!');
      }
      closeResourceModal();
      await fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error(error.message || 'Failed to save resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await resourceService.deleteResource(resourceId);
      toast.success('Resource deleted successfully!');
      await fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error(error.message || 'Failed to delete resource');
    }
  };

  const handleToggleResourceStatus = async (resourceId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await resourceService.updateResourceStatus(resourceId, newStatus);
      toast.success(`Resource ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      await fetchResources();
    } catch (error) {
      console.error('Error updating resource status:', error);
      toast.error(error.message || 'Failed to update resource status');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-panel-premium p-6 mb-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Admin Dashboard</h1>
              <p className="text-slate-600 dark:text-gray-400 mt-1">Manage events, courses, and resources</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b">
            <button
              onClick={() => setActiveTab('events')}
              className={`pb-3 px-2 font-bold transition-colors relative ${activeTab === 'events'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Events
              </div>
              {activeTab === 'events' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-3 px-2 font-bold transition-colors relative ${activeTab === 'courses'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Courses
              </div>
              {activeTab === 'courses' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`pb-3 px-2 font-bold transition-colors relative ${activeTab === 'resources'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Resources
              </div>
              {activeTab === 'resources' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('colleges')}
              className={`pb-3 px-2 font-bold transition-colors relative ${activeTab === 'colleges'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Colleges
              </div>
              {activeTab === 'colleges' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            <div className="glass-panel p-4 mb-6">
              <div className="flex gap-4 border-b border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setEventSubTab('pending')}
                  className={`pb-3 px-4 font-bold transition-colors relative ${eventSubTab === 'pending'
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Approval
                    {pendingEvents.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 text-xs font-bold rounded-full">
                        {pendingEvents.length}
                      </span>
                    )}
                  </div>
                  {eventSubTab === 'pending' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-400"></div>
                  )}
                </button>
                <button
                  onClick={() => setEventSubTab('scraped')}
                  className={`pb-3 px-4 font-bold transition-colors relative ${eventSubTab === 'scraped'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Scraped Events
                    {scrapedEvents.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full">
                        {scrapedEvents.length}
                      </span>
                    )}
                  </div>
                  {eventSubTab === 'scraped' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Pending Events</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingEvents.length}</p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-600 dark:text-orange-400 opacity-20" />
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Scraped Events</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{scrapedEvents.length}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Logged in as</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</p>
                  </div>
                  <Users className="w-12 h-12 text-slate-400 dark:text-gray-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Pending Events Section */}
            {eventSubTab === 'pending' && (
              <>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : pendingEvents.length === 0 ? (
                  <div className="glass-panel p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">All Caught Up!</h3>
                    <p className="text-slate-600 dark:text-gray-400">There are no pending events to review at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingEvents.map((event) => (
                      <div key={event.id} className="glass-panel overflow-hidden">
                        <div className="p-6">
                          {/* Event Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 text-sm font-bold rounded-full">
                                  Pending Approval
                                </span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-sm font-bold rounded-full">
                                  {event.category}
                                </span>
                              </div>
                              <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">{event.title}</h2>
                              <p className="text-slate-600 dark:text-gray-400 mb-4">{event.description}</p>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">Date & Time</p>
                                <p className="text-sm text-slate-600 dark:text-gray-400">{formatDate(event.date)}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">Location</p>
                                <p className="text-sm text-slate-600 dark:text-gray-400">{event.venue || event.city}</p>
                                <p className="text-sm text-slate-500 dark:text-gray-500">{event.college}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">Registration</p>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                  {event.registration_fee === 0 ? 'Free' : `₹${event.registration_fee}`}
                                </p>
                                {event.max_participants && (
                                  <p className="text-sm text-slate-500 dark:text-gray-500">
                                    Max: {event.max_participants} participants
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Additional Info */}
                          {event.tags && event.tags.length > 0 && (
                            <div className="mb-6">
                              <p className="text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Tags</p>
                              <div className="flex flex-wrap gap-2">
                                {event.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 text-sm font-medium rounded-full border border-slate-200 dark:border-white/10"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-4">
                            <button
                              onClick={() => handleApproval(event.id, 'approved')}
                              disabled={processing === event.id}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <CheckCircle className="w-5 h-5" />
                              {processing === event.id ? 'Processing...' : 'Approve Event'}
                            </button>

                            <button
                              onClick={() => openRejectModal(event)}
                              disabled={processing === event.id}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <XCircle className="w-5 h-5" />
                              {processing === event.id ? 'Processing...' : 'Reject Event'}
                            </button>

                            <button
                              onClick={() => openEventModal(event)}
                              disabled={processing === event.id}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                              Edit
                            </button>

                            <button
                              onClick={() => handleToggleFeatured(event.id, event.title, event.featured)}
                              disabled={processing === event.id}
                              className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${event.featured
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-yellow-500 hover:text-white'
                                }`}
                            >
                              <Star className={`w-5 h-5 ${event.featured ? 'fill-current' : ''}`} />
                              {processing === event.id ? '...' : event.featured ? 'Featured' : 'Feature'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Scraped Events Section */}
            {eventSubTab === 'scraped' && (
              <>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : scrapedEvents.length === 0 ? (
                  <div className="glass-panel p-12 text-center">
                    <Calendar className="w-16 h-16 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">No Scraped Events</h3>
                    <p className="text-slate-600 dark:text-gray-400">Scraped events from external sources will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {scrapedEvents.map((event) => (
                      <div key={event.id} className="glass-panel overflow-hidden">
                        <div className="p-6">
                          {/* Event Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 text-sm font-bold rounded-full">
                                  Live
                                </span>
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-sm font-bold rounded-full">
                                  {event.college || 'Scraped'}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-sm font-bold rounded-full">
                                  {event.category}
                                </span>
                                {event.featured && (
                                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 text-sm font-bold rounded-full flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    Featured
                                  </span>
                                )}
                              </div>
                              <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">{event.title}</h2>
                              <p className="text-slate-600 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                            </div>
                            {event.image && (
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-32 h-32 object-cover rounded-lg ml-4 border border-slate-200 dark:border-white/10"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                          </div>

                          {/* Event Details */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">Date & Time</p>
                                <p className="text-sm text-slate-600 dark:text-gray-400">{formatDate(event.date)}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">Location</p>
                                <p className="text-sm text-slate-600 dark:text-gray-400">{event.venue || event.city}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <ExternalLink className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">Source</p>
                                <a
                                  href={event.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                  View Original
                                </a>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">Added</p>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                  {new Date(event.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-4">
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <ExternalLink className="w-5 h-5" />
                              View Event Page
                            </a>

                            <button
                              onClick={() => openEventModal(event)}
                              disabled={processing === event.id}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                              Edit
                            </button>

                            <button
                              onClick={() => handleToggleFeatured(event.id, event.title, event.featured)}
                              disabled={processing === event.id}
                              className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${event.featured
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-yellow-500 hover:text-white'
                                }`}
                            >
                              <Star className={`w-5 h-5 ${event.featured ? 'fill-current' : ''}`} />
                              {processing === event.id ? '...' : event.featured ? 'Featured' : 'Feature'}
                            </button>

                            <button
                              onClick={() => handleDeleteScrapedEvent(event.id, event.title)}
                              disabled={processing === event.id}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                              {processing === event.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
        {activeTab === 'courses' && (
          <>
            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Total Courses</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{courses.length}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Active</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {courses.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Expired</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {courses.filter(c => c.status === 'expired').length}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-600 dark:text-orange-400 opacity-20" />
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => openCourseModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Plus className="w-5 h-5" />
                    Add Course
                  </button>
                </div>
              </div>
            </div>

            {/* Courses List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="glass-panel p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">No Courses Yet</h3>
                <p className="text-slate-600 dark:text-gray-400 mb-6">Start adding courses for students!</p>
                <button
                  onClick={() => openCourseModal()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="glass-panel overflow-hidden">
                    {/* Course Image */}
                    {course.image_url && (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-48 object-cover border-b border-slate-100 dark:border-white/5"
                      />
                    )}

                    <div className="p-6">
                      {/* Course Header */}
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${course.status === 'active'
                          ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300'
                          : course.status === 'expired'
                            ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-gray-400'
                          }`}>
                          {course.status.toUpperCase()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openCourseModal(course)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg group transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
                          >
                            <Edit2 className="w-4 h-4 icon-transition group-hover:scale-110 group-hover:rotate-12" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg group transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                          >
                            <Trash2 className="w-4 h-4 icon-transition group-hover:icon-hover-shake group-hover:scale-110" />
                          </button>
                        </div>
                      </div>

                      {/* Course Info */}
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Issuer and Category */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 dark:text-gray-500 font-medium">
                        <Tag className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span>{course.issuer}</span>
                        <span className="opacity-50">•</span>
                        <span>{course.category}</span>
                      </div>

                      {/* Coupon Code */}
                      {course.coupon_code && (
                        <div className="bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs text-green-600 dark:text-green-400 font-bold mb-1 uppercase tracking-wider">100% OFF</p>
                              <p className="font-mono font-bold text-green-800 dark:text-green-300">
                                {course.coupon_code}
                              </p>
                            </div>
                            <button
                              onClick={() => copyCouponCode(course.coupon_code)}
                              className="p-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <a
                          href={course.course_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all text-sm font-bold shadow-lg shadow-blue-500/20"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Course
                        </a>
                        <button
                          onClick={() => handleToggleCourseStatus(course.id, course.status)}
                          className={`px-4 py-2 rounded-lg transition-all text-sm font-bold border ${course.status === 'active'
                            ? 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                            : 'bg-green-600 dark:bg-green-500 text-white border-transparent hover:bg-green-700 dark:hover:bg-green-600 shadow-lg shadow-green-500/20'
                            }`}
                        >
                          {course.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Resources Section */}
        {activeTab === 'resources' && (
          <>
            {/* Resource Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Total Resources</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{resources.length}</p>
                  </div>
                  <Gift className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Active</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {resources.filter(r => r.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">Inactive</p>
                    <p className="text-3xl font-bold text-slate-600 dark:text-gray-500">
                      {resources.filter(r => r.status === 'inactive').length}
                    </p>
                  </div>
                  <XCircle className="w-12 h-12 text-slate-600 dark:text-gray-500 opacity-20" />
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => openResourceModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Plus className="w-5 h-5" />
                    Add Resource
                  </button>
                </div>
              </div>
            </div>

            {/* Resources List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : resources.length === 0 ? (
              <div className="glass-panel p-12 text-center">
                <Gift className="w-16 h-16 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">No Resources Yet</h3>
                <p className="text-slate-600 dark:text-gray-400 mb-6">Start adding free resources for students!</p>
                <button
                  onClick={() => openResourceModal()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Resource
                </button>
              </div>
            ) : (
              <div className="glass-panel overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-widest">
                  <div className="col-span-3 flex items-center">Resource</div>
                  <div className="col-span-1 flex items-center justify-center">Value</div>
                  <div className="col-span-2 flex items-center">Tags</div>
                  <div className="col-span-5 flex items-center">Description</div>
                  <div className="col-span-1 flex items-center justify-end">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {resources.map((resource) => (
                    <div key={resource.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-300 border-l-4 border-transparent hover:border-primary-500 group-hover:shadow-lg">
                      {/* Resource Name & Icon */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-white dark:bg-white/10 rounded-xl p-2 border border-slate-200 dark:border-white/10 shadow-sm">
                          <img
                            src={resource.icon}
                            alt={resource.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48?text=Icon';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-950 dark:text-white truncate leading-tight">
                            {resource.name}
                          </h3>
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded mt-1 uppercase tracking-wider ${resource.status === 'active'
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400'
                            }`}>
                            {resource.status === 'active' ? 'NEW' : 'INACTIVE'}
                          </span>
                        </div>
                      </div>

                      {/* Value */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="inline-flex items-center px-3 py-1 bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs font-bold rounded-lg border border-green-500/20 whitespace-nowrap">
                          {resource.value || 'N/A'}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="col-span-2 flex items-center">
                        <div className="flex flex-wrap gap-1.5">
                          {resource.tags && resource.tags.length > 0 ? (
                            resource.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 text-[10px] font-bold rounded border border-slate-200 dark:border-white/10">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-gray-500 italic">No tags</span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="col-span-5 flex items-center">
                        <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
                          {resource.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end gap-1.5">
                        <a
                          href={resource.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-slate-800 dark:hover:bg-blue-500 transition-all hover:scale-105 gap-1.5 whitespace-nowrap group shadow-lg shadow-blue-500/10"
                        >
                          Apply Now
                          <ExternalLink className="w-3 h-3 icon-transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                        <button
                          onClick={() => openResourceModal(resource)}
                          className="inline-flex items-center justify-center p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30 group"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 icon-transition group-hover:scale-110 group-hover:rotate-12" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="inline-flex items-center justify-center p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/30 group"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 icon-transition group-hover:icon-hover-shake group-hover:scale-110" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Colleges Tab */}
        {activeTab === 'colleges' && (
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">College Management</h2>
                <p className="text-slate-600 dark:text-gray-400 mt-1 font-medium">Manage colleges and their logos</p>
              </div>
              <button
                onClick={handleAddCollege}
                className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all font-bold shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-5 h-5" />
                Add College
              </button>
            </div>

            {colleges.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-600 dark:text-gray-400 mb-2">No Colleges Found</h3>
                <p className="text-slate-500 dark:text-gray-500">Add your first college to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map((college) => (
                  <div key={college.id} className="glass-panel overflow-hidden group">
                    <div className="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      {college.logo ? (
                        <img src={college.logo} alt={college.name} className="max-h-full max-w-full object-contain drop-shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <Building2 className="w-16 h-16 text-white/80 relative z-10" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          {college.short_name && (
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-1 rounded uppercase tracking-wider">{college.short_name}</span>
                          )}
                          <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-2 line-clamp-1">{college.name}</h3>
                        </div>
                      </div>
                      {college.description && (<p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">{college.description}</p>)}
                      {college.location && (
                        <div className="flex items-center text-slate-500 dark:text-gray-500 text-sm mt-3 font-medium">
                          <MapPin className="w-4 h-4 mr-1 text-primary-600 dark:text-primary-400" />{college.location}
                        </div>
                      )}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <button onClick={() => handleEditCollege(college)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all text-sm font-bold border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30">
                          <Edit2 className="w-3.5 h-3.5" />Edit
                        </button>
                        <button onClick={() => handleDeleteCollege(college.id, college.name)} disabled={processing === college.id} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-all text-sm font-bold border border-transparent hover:border-red-200 dark:hover:border-red-500/30 disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && selectedEvent && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
            onMouseDown={(e) => { mouseDownRef.current = e.target; }}
            onClick={(e) => {
              if (e.target === e.currentTarget && mouseDownRef.current === e.currentTarget) {
                closeRejectModal();
              }
            }}
          >
            <div className="glass-panel-premium max-w-md w-full overflow-hidden transform transition-all border border-red-500/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reject Event</h3>
                  </div>
                  <button
                    onClick={closeRejectModal}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-slate-600 dark:text-gray-400 mb-4 font-medium">
                  Are you sure you want to reject "<strong>{selectedEvent.title}</strong>"?
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Rejection Reason (Optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Let the organizer know why their event was rejected..."
                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                    rows="4"
                  />
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-2 font-medium">
                    This reason will be sent to the event organizer via notification.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeRejectModal}
                    disabled={processing === selectedEvent.id}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    disabled={processing === selectedEvent.id}
                    className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-50 text-white dark:text-red-600 rounded-lg hover:bg-red-700 dark:hover:bg-white disabled:opacity-50 transition-all font-bold shadow-lg shadow-red-500/20"
                  >
                    {processing === selectedEvent.id ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* College Modal */}
        {showCollegeModal && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
            onWheel={(e) => e.stopPropagation()}
            onMouseDown={(e) => { mouseDownRef.current = e.target; }}
            onClick={(e) => {
              if (e.target === e.currentTarget && mouseDownRef.current === e.currentTarget) {
                setShowCollegeModal(false);
                setEditingCollege(null);
                setCollegeFormData({
                  name: '', short_name: '', logo: '', description: '', location: '', city: '', state: '', website: '', contact_email: '', contact_phone: '', established_year: '', affiliated_to: '', status: 'active'
                });
              }
            }}
          >
            <div
              className="glass-panel-premium max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                      {editingCollege ? 'Edit College' : 'Add New College'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowCollegeModal(false);
                      setEditingCollege(null);
                      setCollegeFormData({
                        name: '', short_name: '', logo: '', description: '', location: '', city: '', state: '', website: '', contact_email: '', contact_phone: '', established_year: '', affiliated_to: '', status: 'active'
                      });
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div
                className="p-6 overflow-y-auto flex-1 custom-scrollbar"
                onWheel={(e) => e.stopPropagation()}
                data-lenis-prevent
              >
                <form onSubmit={handleCollegeSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        College Name *
                      </label>
                      <input
                        type="text"
                        value={collegeFormData.name}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Short Name *
                      </label>
                      <input
                        type="text"
                        value={collegeFormData.short_name}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, short_name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Status *
                      </label>
                      <select
                        value={collegeFormData.status}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, status: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        required
                      >
                        <option value="active" className="dark:bg-slate-900">Active</option>
                        <option value="inactive" className="dark:bg-slate-900">Inactive</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={collegeFormData.logo}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, logo: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 font-medium">Enter the URL of the college logo (PNG, JPG, SVG)</p>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={collegeFormData.description}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        rows="3"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Location/Address
                      </label>
                      <input
                        type="text"
                        value={collegeFormData.location}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, location: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={collegeFormData.city}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, city: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={collegeFormData.state}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, state: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={collegeFormData.website}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, website: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white font-medium"
                        placeholder="https://college-website.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={collegeFormData.contact_email}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, contact_email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={collegeFormData.contact_phone}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, contact_phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Established Year
                      </label>
                      <input
                        type="number"
                        value={collegeFormData.established_year}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, established_year: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Affiliated To
                      </label>
                      <input
                        type="text"
                        value={collegeFormData.affiliated_to}
                        onChange={(e) => setCollegeFormData({ ...collegeFormData, affiliated_to: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="e.g., VTU, AICTE"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCollegeModal(false);
                        setEditingCollege(null);
                        setCollegeFormData({
                          name: '', short_name: '', logo: '', description: '', location: '', city: '', state: '', website: '', contact_email: '', contact_phone: '', established_year: '', affiliated_to: '', status: 'active'
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 transition-all font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-all font-bold shadow-lg shadow-indigo-500/20"
                    >
                      {processing ? 'Saving...' : (editingCollege ? 'Update College' : 'Add College')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Event Edit Modal */}
        {showEventModal && editingEvent && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden transition-all duration-300"
            onMouseDown={(e) => { mouseDownRef.current = e.target; }}
            onClick={(e) => {
              if (e.target === e.currentTarget && mouseDownRef.current === e.currentTarget) {
                closeEventModal();
              }
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            <div
              className="glass-panel-premium max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleEventSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Edit2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Edit Event</h3>
                    </div>
                    <button type="button" onClick={closeEventModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar" onWheel={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Title <span className="text-red-500">*</span></label>
                      <input type="text" name="title" value={eventFormData.title} onChange={handleEventFormChange} required
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Description <span className="text-red-500">*</span></label>
                      <textarea name="description" value={eventFormData.description} onChange={handleEventFormChange} required rows="3"
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Category</label>
                      <input type="text" name="category" value={eventFormData.category} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="e.g., Hackathon, Workshop" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Event Type</label>
                      <select name="eventType" value={eventFormData.eventType} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white">
                        <option value="" className="dark:bg-slate-900">Select type</option>
                        <option value="online" className="dark:bg-slate-900">Online</option>
                        <option value="offline" className="dark:bg-slate-900">Offline</option>
                        <option value="hybrid" className="dark:bg-slate-900">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Start Date &amp; Time</label>
                      <input type="datetime-local" name="dateStart" value={eventFormData.dateStart} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">End Date &amp; Time</label>
                      <input type="datetime-local" name="dateEnd" value={eventFormData.dateEnd} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Registration Deadline</label>
                      <input type="datetime-local" name="registrationDeadline" value={eventFormData.registrationDeadline} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Venue</label>
                      <input type="text" name="venue" value={eventFormData.venue} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="Venue / Hall name" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">City</label>
                      <input type="text" name="city" value={eventFormData.city} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="City" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Organiser / College</label>
                      <input type="text" name="collegeName" value={eventFormData.collegeName} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="College / organisation name" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Registration Fee (₹)</label>
                      <input type="number" name="registrationFee" value={eventFormData.registrationFee} onChange={handleEventFormChange} min="0"
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Registration Link</label>
                      <input type="url" name="registrationLink" value={eventFormData.registrationLink} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="https://..." />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Image URL</label>
                      <input type="url" name="image" value={eventFormData.image} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="https://..." />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Tags <span className="text-xs font-normal text-slate-500">(comma-separated)</span></label>
                      <input type="text" name="tags" value={eventFormData.tags} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="e.g., AI, Machine Learning, Beginner" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Requirements <span className="text-xs font-normal text-slate-500">(comma-separated)</span></label>
                      <input type="text" name="requirements" value={eventFormData.requirements} onChange={handleEventFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="e.g., Laptop, Team of 2-4" />
                    </div>

                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex-shrink-0">
                  <div className="flex gap-3">
                    <button type="button" onClick={closeEventModal}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold">
                      Cancel
                    </button>
                    <button type="submit" disabled={processing === editingEvent.id}
                      className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-all font-bold shadow-lg shadow-indigo-500/20">
                      {processing === editingEvent.id ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Course Modal */}
        {showCourseModal && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden transition-all duration-300"
            onMouseDown={(e) => { mouseDownRef.current = e.target; }}
            onClick={(e) => {
              if (e.target === e.currentTarget && mouseDownRef.current === e.currentTarget) {
                closeCourseModal();
              }
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            <div
              className="glass-panel-premium max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleCourseSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                        {editingCourse ? 'Edit Course' : 'Add New Course'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeCourseModal}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div
                  className="p-6 overflow-y-auto flex-1 custom-scrollbar"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Course Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={courseFormData.title}
                        onChange={handleCourseFormChange}
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                        placeholder="e.g., Complete Web Development Bootcamp"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={courseFormData.description}
                        onChange={handleCourseFormChange}
                        required
                        rows="3"
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                        placeholder="Brief description of the course"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Issuer/Platform <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="issuer"
                        value={courseFormData.issuer}
                        onChange={handleCourseFormChange}
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="e.g., Udemy, Coursera, Google"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Instructor
                      </label>
                      <input
                        type="text"
                        name="instructor"
                        value={courseFormData.instructor}
                        onChange={handleCourseFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="Instructor name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={courseFormData.category}
                        onChange={handleCourseFormChange}
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="e.g., Web Development, Data Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Level
                      </label>
                      <select
                        name="level"
                        value={courseFormData.level}
                        onChange={handleCourseFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                      >
                        <option value="Beginner" className="dark:bg-slate-900">Beginner</option>
                        <option value="Intermediate" className="dark:bg-slate-900">Intermediate</option>
                        <option value="Advanced" className="dark:bg-slate-900">Advanced</option>
                        <option value="All Levels" className="dark:bg-slate-900">All Levels</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Course URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        name="course_url"
                        value={courseFormData.course_url}
                        onChange={handleCourseFormChange}
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        name="image_url"
                        value={courseFormData.image_url}
                        onChange={handleCourseFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="Course thumbnail URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex-shrink-0">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeCourseModal}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 transition-all font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all font-bold shadow-lg shadow-blue-500/20"
                    >
                      {editingCourse ? 'Update Course' : 'Add Course'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resource Modal */}
        {showResourceModal && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden transition-all duration-300"
            onMouseDown={(e) => { mouseDownRef.current = e.target; }}
            onClick={(e) => {
              if (e.target === e.currentTarget && mouseDownRef.current === e.currentTarget) {
                closeResourceModal();
              }
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            <div
              className="glass-panel-premium max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleResourceSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                        {editingResource ? 'Edit Resource' : 'Add New Resource'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeResourceModal}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div
                  className="p-6 overflow-y-auto flex-1 custom-scrollbar"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Resource Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={resourceFormData.name}
                        onChange={handleResourceFormChange}
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                        placeholder="e.g., GitHub Student Developer Pack"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={resourceFormData.description}
                        onChange={handleResourceFormChange}
                        required
                        rows="3"
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                        placeholder="Brief description of the resource"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Value
                      </label>
                      <input
                        type="text"
                        name="value"
                        value={resourceFormData.value}
                        onChange={handleResourceFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="e.g., $200k, Free, 6 months"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={resourceFormData.category}
                        onChange={handleResourceFormChange}
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                      >
                        <option value="" className="dark:bg-slate-900">Select Category</option>
                        <option value="Free Stuff" className="dark:bg-slate-900">Free Stuff</option>
                        <option value="Fellowships" className="dark:bg-slate-900">Fellowships</option>
                        <option value="Tools" className="dark:bg-slate-900">Tools</option>
                        <option value="Cloud Credits" className="dark:bg-slate-900">Cloud Credits</option>
                        <option value="Software" className="dark:bg-slate-900">Software</option>
                        <option value="Learning" className="dark:bg-slate-900">Learning</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Apply/Access URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        name="apply_url"
                        value={resourceFormData.apply_url}
                        onChange={handleResourceFormChange}
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Icon/Logo URL
                      </label>
                      <input
                        type="url"
                        name="icon"
                        value={resourceFormData.icon}
                        onChange={handleResourceFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                        Tags <span className="text-xs font-normal text-slate-500">(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={resourceFormData.tags}
                        onChange={handleResourceFormChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="e.g., AI, Free, Tools"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex-shrink-0">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeResourceModal}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 transition-all font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all font-bold shadow-lg shadow-blue-500/20"
                    >
                      {editingResource ? 'Update Resource' : 'Add Resource'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-24 md:bottom-8 right-6 md:right-8 p-4 bg-primary-600 dark:bg-primary-500 text-white rounded-full shadow-2xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-all duration-300 hover:scale-110 border-2 border-white dark:border-white/20 group z-[9999] ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Admin;
