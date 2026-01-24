import React, { createContext, useState, useEffect, useContext } from 'react';

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
    // --- State ---
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Initialize Font Scale (Handle legacy strings if present)
    const [fontScale, setFontScale] = useState(() => {
        const stored = localStorage.getItem('fontScale');
        const legacy = localStorage.getItem('fontSize');

        if (stored) return parseInt(stored);

        // Migrate legacy values
        if (legacy) {
            const legacyMap = { 'small': 85, 'medium': 100, 'large': 115, 'xl': 130 };
            return legacyMap[legacy] || 100;
        }

        return 100;
    });

    const [glassIntensity, setGlassIntensityState] = useState(
        parseInt(localStorage.getItem('glassIntensity')) || 10
    );

    // --- Effects ---

    // 1. Theme Effect
    useEffect(() => {
        const applyTheme = () => {
            let targetTheme = theme.toLowerCase();

            if (targetTheme === 'system') {
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                targetTheme = systemDark ? 'dark' : 'light';
            }

            document.documentElement.setAttribute('data-theme', targetTheme);
        };

        applyTheme();
        localStorage.setItem('theme', theme);

        // Listener for system changes if mode is system
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    // 2. Font Scale Effect
    useEffect(() => {
        // Convert integer percentage (e.g. 110) to decimal scale (1.1)
        const scaleValue = fontScale / 100;
        document.documentElement.style.setProperty('--font-scale', scaleValue);
        localStorage.setItem('fontScale', fontScale);

        // Clear legacy key to avoid confusion
        localStorage.removeItem('fontSize');
    }, [fontScale]);

    // 3. Glass Intensity Effect
    useEffect(() => {
        document.documentElement.style.setProperty('--glass-blur', `${glassIntensity}px`);
        localStorage.setItem('glassIntensity', glassIntensity.toString());
    }, [glassIntensity]);

    // 4. High Contrast Effect
    const [highContrast, setHighContrast] = useState(
        localStorage.getItem('highContrast') === 'true'
    );

    useEffect(() => {
        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
            setTheme('dark'); // Force dark mode
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
        localStorage.setItem('highContrast', highContrast);
    }, [highContrast]);

    // --- Helpers ---

    const toggleTheme = () => {
        if (highContrast) return; // Locked in High Contrast
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setGlassIntensity = (intensity) => {
        // Clamp between 0 and 20
        const clamped = Math.max(0, Math.min(20, intensity));
        setGlassIntensityState(clamped);
    };

    return (
        <PreferencesContext.Provider value={{
            theme, toggleTheme, setTheme,
            fontScale, setFontScale,
            glassIntensity, setGlassIntensity,
            highContrast, setHighContrast
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => useContext(PreferencesContext);
