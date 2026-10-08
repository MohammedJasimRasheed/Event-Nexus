import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building, Edit2, Save, X, CheckCircle, AlertCircle, Camera, Calendar } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    bio: user?.bio || ''
  });
  
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0.6]);
  const heroY = useTransform(scrollY, [0, 200], [0, 30]);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      college: user?.college || '',
      bio: user?.bio || ''
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      college: user?.college || '',
      bio: user?.bio || ''
    });
    setPreviewAvatar(null);
    setIsEditing(false);
    setError('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  const cardClasses = "p-6 rounded-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-3xl ring-1 ring-white/70 dark:ring-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.3)] hover:scale-[1.015] transition-all duration-300";
  const iconWrapperClasses = "w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-[0_2px_10px_rgb(0,0,0,0.05)] dark:shadow-none ring-1 ring-white/50 dark:ring-white/5";
  const inputContainerClasses = "w-full px-4 py-3.5 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all text-base font-semibold shadow-[0_2px_8px_rgb(0,0,0,0.02),inset_0_1px_1px_rgba(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-700/60";
  const staticContainerClasses = "w-full px-4 py-3.5 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-[0_2px_8px_rgb(0,0,0,0.02)]";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60 dark:from-slate-900 dark:to-[rgb(12,16,28)] transition-colors duration-500 overflow-x-hidden pb-20">
      {/* Messages */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            {success && (
              <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 shadow-2xl flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <p className="text-green-600 dark:text-green-400 font-semibold">{success}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4 shadow-2xl flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section (Banner) */}
      <motion.div 
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative h-[28vh] min-h-[220px] w-full origin-top"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 dark:from-indigo-900 dark:via-purple-900 dark:to-blue-900 overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-[80px] mix-blend-overlay opacity-30"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl mix-blend-screen animate-pulse duration-[10000ms]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl mix-blend-screen animate-pulse duration-[7000ms]"></div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Profile Header (Avatar + User Info + Edit Button) */}
        <div className="relative -mt-20 sm:-mt-24 mb-10 w-full">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between w-full">
            
            {/* Avatar & Text Block aligned to left vertical grid */}
            <div className="flex flex-col items-center md:items-start w-full md:w-auto">
              
              {/* Interactive Avatar */}
              <div className="relative group w-36 h-36 sm:w-44 sm:h-44 rounded-full border-[6px] border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-900 shadow-[0_12px_40px_rgb(0,0,0,0.12)] overflow-hidden cursor-pointer transition-all duration-300 transform group-hover:scale-[1.02]">
                {previewAvatar || user?.avatar ? (
                  <img
                    src={previewAvatar || user.avatar}
                    alt={user?.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 transition-transform duration-500 group-hover:scale-105">
                    <span className="text-6xl sm:text-7xl font-black text-slate-400 dark:text-slate-600">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                
                {/* Hover overlay for editing */}
                {isEditing && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Camera className="w-10 h-10 text-white drop-shadow-md" />
                  </div>
                )}
              </div>
              
              {/* Glowing ring under avatar */}
              {isEditing && (
                 <div className="absolute top-0 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-36 h-36 sm:w-44 sm:h-44 rounded-full border-[4px] border-primary-500/0 hover:border-primary-500/30 pointer-events-none transition-colors duration-300 -z-10 scale-[1.08]"></div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />

              {/* User Identity Text */}
              <div className="mt-5 text-center md:text-left flex flex-col items-center md:items-start">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm tracking-tight">
                  {user?.name || 'Your Profile'}
                </h1>
                <div className="mt-2 text-slate-500 dark:text-slate-400 text-[15px] font-medium flex items-center justify-center md:justify-start gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-4.5 h-4.5 text-slate-400" />
                    <span>{user?.college || 'No college specified'}</span>
                  </div>
                  <span className="opacity-40 px-1">•</span>
                  <span className="capitalize px-3 py-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300">
                    {user?.role || 'Guest'}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button aligned with baseline */}
            {!isEditing && (
              <div className="mt-6 md:mt-0 md:mb-1 w-full md:w-auto flex justify-center md:justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-all font-semibold shadow-sm hover:shadow-[0_4px_15px_rgb(0,0,0,0.06)] ring-1 ring-slate-100 dark:ring-transparent"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <form onSubmit={handleSubmit} className="pb-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Full Name Card */}
            <motion.div variants={itemVariants} className={cardClasses}>
              <label className="flex items-center text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                <div className={`${iconWrapperClasses} bg-primary-50 dark:bg-primary-900/30`}>
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputContainerClasses} focus:ring-primary-500/20 dark:focus:ring-primary-500/40 border-primary-100 dark:border-primary-900/30`}
                />
              ) : (
                <div className={staticContainerClasses}>
                  <p className="text-slate-900 dark:text-white text-base font-semibold">{user?.name}</p>
                </div>
              )}
            </motion.div>

            {/* Email Card */}
            <motion.div variants={itemVariants} className={cardClasses}>
              <label className="flex items-center text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                <div className={`${iconWrapperClasses} bg-blue-50 dark:bg-blue-900/30`}>
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Email Address
              </label>
              <div className={`flex justify-between items-center ${staticContainerClasses}`}>
                <p className="text-slate-700 dark:text-slate-300 text-base font-semibold break-all">{user?.email}</p>
                {isEditing && <span className="text-[11px] uppercase tracking-wider bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 ml-3 whitespace-nowrap font-bold">Read-only</span>}
              </div>
            </motion.div>

            {/* College Card */}
            <motion.div variants={itemVariants} className={cardClasses}>
              <label className="flex items-center text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                <div className={`${iconWrapperClasses} bg-purple-50 dark:bg-purple-900/30`}>
                  <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                College / University
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Where do you study?"
                  className={`${inputContainerClasses} focus:ring-purple-500/20 dark:focus:ring-purple-500/40 border-purple-100 dark:border-purple-900/30`}
                />
              ) : (
                <div className={staticContainerClasses}>
                  <p className="text-slate-900 dark:text-white text-base font-semibold">
                    {user?.college || <span className="text-slate-400 italic font-normal">Not specified</span>}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Account Info Card */}
            <motion.div variants={itemVariants} className={cardClasses}>
              <label className="flex items-center text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                <div className={`${iconWrapperClasses} bg-emerald-50 dark:bg-emerald-900/30`}>
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Account Overview
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className={staticContainerClasses}>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Role</span>
                  <span className="text-slate-900 dark:text-white font-bold capitalize text-base">{user?.role || 'User'}</span>
                </div>
                <div className={staticContainerClasses}>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Joined</span>
                  <span className="text-slate-900 dark:text-white font-bold whitespace-nowrap text-base">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Unknown'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Bio Card (Full Width) */}
            <motion.div variants={itemVariants} className={`md:col-span-2 ${cardClasses}`}>
              <label className="flex items-center text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                <div className={`${iconWrapperClasses} bg-amber-50 dark:bg-amber-900/30`}>
                  <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                About Me
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Share your interests, skills, and what you're looking for..."
                  className={`resize-y ${inputContainerClasses} focus:ring-amber-500/20 dark:focus:ring-amber-500/40 border-amber-100 dark:border-amber-900/30`}
                />
              ) : (
                <div className={`${staticContainerClasses} relative overflow-hidden group border-amber-100/50 dark:border-amber-900/20`}>
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400/40 group-hover:bg-amber-400 transition-colors duration-300"></div>
                  <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium min-h-[5rem] pl-2">
                    {user?.bio || <span className="text-slate-400 italic font-normal">No bio added yet. Tell the community about yourself.</span>}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="mt-10 flex flex-col-reverse sm:flex-row justify-end items-center gap-4"
              >
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold text-base"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-bold text-base shadow-[0_8px_20px_rgb(59,130,246,0.3)] hover:shadow-[0_12px_25px_rgb(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 transform skew-x-12 -translate-x-full group-hover:animate-shimmer"></div>
                  <Save className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{loading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

export default Profile;
