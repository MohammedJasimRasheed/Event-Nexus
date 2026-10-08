import { useNavigate } from 'react-router-dom';
import {
    Terminal,
    Briefcase,
    Trophy,
    BookOpen,
    Users,
    Code,
    Lightbulb,
    PresentationIcon
} from 'lucide-react';

const MobileCategoryGrid = () => {
    const navigate = useNavigate();

    const categories = [
        { name: 'Hackathons', path: '/hackathons', icon: Terminal, color: 'bg-indigo-500/10 text-indigo-600' },
        { name: 'Internships', path: '/events?search=internship', icon: Briefcase, color: 'bg-blue-500/10 text-blue-600' },
        { name: 'Competitions', path: '/competitions', icon: Trophy, color: 'bg-orange-500/10 text-orange-600' },
        { name: 'Courses', path: '/courses', icon: BookOpen, color: 'bg-green-500/10 text-green-600' },
        { name: 'Workshops', path: '/events?search=workshop', icon: Users, color: 'bg-purple-500/10 text-purple-600' },
        { name: 'Resources', path: '/free-resources', icon: Lightbulb, color: 'bg-yellow-500/10 text-yellow-600' },
        { name: 'Mentorship', path: '/events?search=mentorship', icon: PresentationIcon, color: 'bg-pink-500/10 text-pink-600' },
        { name: 'Coding', path: '/events?search=coding', icon: Code, color: 'bg-cyan-500/10 text-cyan-600' },
    ];

    return (
        <div className="md:hidden mt-8 mb-12">
            <div className="grid grid-cols-3 gap-3 px-4 justify-center">
                {categories.map((category) => (
                    <button
                        key={category.name}
                        onClick={() => navigate(category.path)}
                        className="flex flex-col items-center justify-center h-[80px] rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-white/5 active:scale-95 transition-all shadow-sm gap-1.5"
                    >
                        <div className={`p-2 rounded-xl ${category.color}`}>
                            <category.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize text-center px-1">
                            {category.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MobileCategoryGrid;
