"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = ThemeProvider;
exports.useTheme = useTheme;
const react_1 = require("react");
const ThemeContext = (0, react_1.createContext)(undefined);
function ThemeProvider({ children }) {
    const [theme, setTheme] = (0, react_1.useState)(() => {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme)
            return savedTheme;
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });
    const [isFirstRender, setIsFirstRender] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const root = window.document.documentElement;
        // Remove transitions on first render to avoid flash
        if (isFirstRender) {
            root.classList.add('no-transitions');
            setTimeout(() => {
                root.classList.remove('no-transitions');
                setIsFirstRender(false);
            }, 0);
        }
        // Remove old theme
        root.classList.remove('light', 'dark');
        // Add new theme
        root.classList.add(theme);
        // Save to localStorage
        localStorage.setItem('theme', theme);
    }, [theme, isFirstRender]);
    // Listen to system theme changes
    (0, react_1.useEffect)(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };
    return (<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>);
}
function useTheme() {
    const context = (0, react_1.useContext)(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
