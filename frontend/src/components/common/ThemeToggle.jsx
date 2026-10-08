import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-gray-400 hover:text-primary-600 group"
            aria-label="Toggle theme"
            title="Switch theme"
        >
            <div className="relative w-[18px] h-[18px]">
                <Sun
                    className={`absolute inset-0 w-[18px] h-[18px] text-amber-500 transition-all duration-300 transform ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                        }`}
                />
                <Moon
                    className={`absolute inset-0 w-[18px] h-[18px] text-blue-400 transition-all duration-300 transform ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                        }`}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
