import { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({
    theme: "system",
    setTheme: () => null,
});

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem(storageKey) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;

        // Batch class changes to avoid layout thrashing
        const newTheme = theme === "system"
            ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            : theme;

        const oldTheme = newTheme === "dark" ? "light" : "dark";

        // Add transition-lock to prevent layout shifts/transitions during theme change
        root.classList.add('theme-switching');

        // Use requestAnimationFrame to batch the DOM change
        requestAnimationFrame(() => {
            root.classList.remove(oldTheme);
            root.classList.add(newTheme);

            // Remove the transition-lock after a short delay
            setTimeout(() => {
                root.classList.remove('theme-switching');
            }, 300);
        });
    }, [theme]);

    const value = {
        theme,
        setTheme: (newTheme) => {
            localStorage.setItem(storageKey, newTheme);
            setTheme(newTheme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
