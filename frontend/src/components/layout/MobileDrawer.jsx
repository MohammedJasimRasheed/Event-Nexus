import { Link } from 'react-router-dom';
import {
    X,
    Home,
    Calendar,
    BookOpen,
    Gift,
    Shield,
    Plus,
    User,
    LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileDrawer = ({ isOpen, onClose }) => {
    const { user, isAuthenticated, logout } = useAuth();

    const navigationItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'Courses', path: '/courses', icon: BookOpen },
        { name: 'Free Resources', path: '/free-resources', icon: Gift },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed left-0 top-0 h-full w-[80%] max-w-[320px] bg-white dark:bg-slate-900 z-[1002] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
                        <div className="flex items-center space-x-3">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                            <span className="text-xl font-bold gradient-text">EventNexus</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* User Info */}
                    {isAuthenticated && (
                        <div className="p-6 bg-slate-50 dark:bg-white/5 mx-4 mt-6 rounded-2xl flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-primary-600" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4">
                        <div className="space-y-2">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className="flex items-center space-x-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-all group"
                                >
                                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}

                            <div className="my-4 border-t border-gray-100 dark:border-white/10 mx-2" />

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={onClose}
                                        className="flex items-center space-x-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/5 transition-all"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        <span className="font-medium">Dashboard</span>
                                    </Link>
                                    <Link
                                        to="/profile"
                                        onClick={onClose}
                                        className="flex items-center space-x-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/5 transition-all"
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="font-medium">Profile</span>
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            onClick={onClose}
                                            className="flex items-center space-x-4 px-4 py-3 rounded-xl text-red-600 bg-red-50 dark:bg-red-900/10 transition-all"
                                        >
                                            <Shield className="w-5 h-5" />
                                            <span className="font-bold">Admin Dashboard</span>
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 px-2">
                                    <Link
                                        to="/login"
                                        onClick={onClose}
                                        className="flex items-center justify-center py-3 rounded-xl border border-primary-600 text-primary-600 font-bold"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={onClose}
                                        className="flex items-center justify-center py-3 rounded-xl gradient-bg text-white font-bold"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Footer Card */}
                    <div className="p-6 mt-auto">
                        <Link
                            to="/create-event"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 gradient-bg text-white rounded-xl py-4 transition-all shadow-lg font-bold"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Host Event</span>
                        </Link>

                        {isAuthenticated && (
                            <button
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="w-full mt-4 text-center text-red-600 font-bold py-2"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileDrawer;
