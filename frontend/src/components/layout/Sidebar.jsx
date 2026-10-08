import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Calendar,
  BookOpen,
  Code,
  Trophy,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Gift,
  Building2
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Colleges', path: '/colleges', icon: Building2 },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Free Resources', path: '/free-resources', icon: Gift },
  ];

  const userRoles = [
    { name: 'Student', icon: User, color: 'bg-gradient-to-r from-blue-600 to-slate-900 shadow-md' },
    { name: 'Admin', icon: Shield, color: 'bg-gradient-to-r from-blue-600 to-slate-900 shadow-md' },
  ];

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] glass-panel-premium border-r border-white/20 shadow-2xl transition-[width] duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-white/80 dark:bg-slate-800/90 border border-white/40 dark:border-white/10 !rounded-full p-1.5 shadow-lg hover:scale-110 hover:bg-white/90 dark:hover:bg-slate-700 transition-transform"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <div className="flex flex-col h-full py-6">
          {/* User Roles Section */}
          {isCollapsed && (
            <div className="flex flex-col items-center space-y-4 px-4 pb-6 border-b border-white/30">
              {userRoles.map((role) => {
                const isAdminIndicator = user?.role === 'admin' && role.name === 'Admin';
                return (
                  <button
                    key={role.name}
                    className={`w-12 h-12 rounded-full ${role.color} flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl group ${isAdminIndicator ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-white' : ''}`}
                    title={role.name + (isAdminIndicator ? ' (Logged in)' : '')}
                  >
                    <role.icon className="w-6 h-6 icon-transition group-hover:icon-hover-wave" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Host Event Button */}
          <div className={`px-4 ${isCollapsed ? 'mb-6 mt-6' : 'mb-4'}`}>
            <Link
              to="/create-event"
              className={`flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-xl py-3 hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg hover:shadow-blue-900/20 group ${isCollapsed ? 'w-12 h-12 mx-auto' : 'w-full'
                }`}
              title="Host Event"
            >
              <Plus className="w-5 h-5 icon-transition group-hover:rotate-90" />
              {!isCollapsed && <span className="font-medium">Host Event</span>}
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${isActive
                      ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:backdrop-blur-sm hover:shadow-sm'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 icon-transition group-hover:scale-110 ${isActive ? 'text-primary-600 icon-pulse-glow' : 'group-hover:text-primary-500'}`} />
                    {!isCollapsed && (
                      <span className={`font-medium transition-all ${isActive ? 'text-primary-600' : 'group-hover:text-primary-600'}`}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Admin Dashboard Link - Only visible to admins */}
              {user?.role === 'admin' && (
                <>
                  <div className="my-3 border-t border-white/30"></div>
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${isActivePath('/admin')
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-red-600 dark:text-red-400 hover:bg-white/60 dark:hover:bg-red-500/10 hover:backdrop-blur-sm hover:shadow-sm'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? 'Admin Dashboard' : ''}
                  >
                    <Shield className={`w-5 h-5 flex-shrink-0 icon-transition group-hover:scale-110 group-hover:icon-hover-shake ${isActivePath('/admin') ? 'text-red-600 icon-pulse-glow' : ''}`} />
                    {!isCollapsed && (
                      <span className={`font-semibold transition-all ${isActivePath('/admin') ? 'text-red-600' : 'group-hover:text-red-700'}`}>
                        Admin Dashboard
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* User Roles Section - Expanded View */}
          {!isCollapsed && (
            <div className="px-4 pt-6 border-t border-white/30 dark:border-white/10 mt-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Browse as
              </p>
              <div className="space-y-2">
                {userRoles.map((role) => {
                  const isAdminIndicator = user?.role === 'admin' && role.name === 'Admin';
                  return (
                    <button
                      key={role.name}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-sm transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-full ${role.color} flex items-center justify-center text-white shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all ${isAdminIndicator ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-white' : ''}`}>
                        <role.icon className="w-5 h-5 icon-transition group-hover:icon-hover-bounce" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                        {role.name} {isAdminIndicator && <span className="text-xs text-green-600 ml-1">(Logged in)</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Spacer for content */}
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 transition-[width] duration-300`} />
    </>
  );
};

export default Sidebar;
