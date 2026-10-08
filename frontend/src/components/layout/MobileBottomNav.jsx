import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Bookmark, User } from 'lucide-react';

const MobileBottomNav = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Discover', path: '/events', icon: Compass },
        { name: 'Saved', path: '/favorites', icon: Bookmark },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] md:hidden">
            <div className="flex items-center justify-around gap-2 bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[30px] p-2 shadow-2xl min-w-[320px]">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center py-2 px-6 rounded-full transition-all duration-300 ${active
                                    ? 'bg-gradient-to-r from-blue-600 to-slate-900 border-transparent text-white shadow-lg shadow-blue-900/20 scale-105'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <item.icon className={`w-6 h-6 ${active ? 'animate-bounce-short' : ''}`} />
                            <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${active ? 'block' : 'hidden'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

// Add CSS for short animation
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-short {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  .animate-bounce-short {
    animation: bounce-short 0.4s ease-out;
  }
`;
document.head.appendChild(style);

export default MobileBottomNav;
