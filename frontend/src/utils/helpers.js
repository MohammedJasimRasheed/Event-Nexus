import {
  Code,
  Trophy,
  BookOpen,
  Mic,
  Music,
  Dumbbell,
  GraduationCap,
  Users,
  Calendar,
  Laptop
} from 'lucide-react';

export const getCategoryIcon = (category) => {
  const icons = {
    'hackathon': Laptop,
    'coding-contest': Code,
    'workshop': BookOpen,
    'seminar': Mic,
    'tech-talk': Mic,
    'cultural': Music,
    'sports': Dumbbell,
    'academic': GraduationCap,
    'networking': Users,
    'other': Calendar
  };
  return icons[category] || Calendar;
};

export const getCategoryColor = (category) => {
  const colors = {
    'hackathon': 'bg-purple-100 text-purple-800',
    'coding-contest': 'bg-blue-100 text-blue-800',
    'workshop': 'bg-green-100 text-green-800',
    'seminar': 'bg-yellow-100 text-yellow-800',
    'tech-talk': 'bg-orange-100 text-orange-800',
    'cultural': 'bg-pink-100 text-pink-800',
    'sports': 'bg-red-100 text-red-800',
    'academic': 'bg-indigo-100 text-indigo-800',
    'networking': 'bg-teal-100 text-teal-800',
    'other': 'bg-gray-100 text-gray-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export const formatDate = (dateString) => {
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

export const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const startOptions = { month: 'short', day: 'numeric' };
  const endOptions = { month: 'short', day: 'numeric', year: 'numeric' };

  if (!end || start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-IN', { ...endOptions, weekday: 'short' });
  }

  return `${start.toLocaleDateString('en-IN', startOptions)} - ${end.toLocaleDateString('en-IN', endOptions)}`;
};

export const formatEventType = (type) => {
  const types = {
    'online': 'Online',
    'offline': 'In-Person',
    'hybrid': 'Hybrid'
  };
  return types[type] || type;
};

export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

export const getDaysUntil = (date) => {
  const now = new Date();
  const eventDate = new Date(date);
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Event passed';
  if (diffDays === 0) return 'Today!';
  if (diffDays === 1) return 'Tomorrow!';
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};
