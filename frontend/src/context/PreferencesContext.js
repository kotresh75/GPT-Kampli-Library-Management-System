import React, { createContext, useState, useEffect, useContext } from 'react';

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
    // --- State ---
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'medium');
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

    // 2. Font Size Effect (using --font-scale for better scaling)
    useEffect(() => {
        const scaleMap = {
            small: '0.875',   // 0.875 = 14/16
            medium: '1',      // 1 = default
            large: '1.125',   // 1.125 = 18/16
            xl: '1.25'        // 1.25 = 20/16
        };
        document.documentElement.style.setProperty('--font-scale', scaleMap[fontSize]);
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    // 3. Glass Intensity Effect
    useEffect(() => {
        document.documentElement.style.setProperty('--glass-blur', `${glassIntensity}px`);
        localStorage.setItem('glassIntensity', glassIntensity.toString());
    }, [glassIntensity]);

    // --- Helpers ---

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setFontSizeHandler = (size) => {
        if (['small', 'medium', 'large', 'xl'].includes(size)) {
            setFontSize(size);
        }
    };

    const setGlassIntensity = (intensity) => {
        // Clamp between 0 and 20
        const clamped = Math.max(0, Math.min(20, intensity));
        setGlassIntensityState(clamped);
    };

    return (
        <PreferencesContext.Provider value={{
            theme, toggleTheme, setTheme,
            fontSize, setFontSize: setFontSizeHandler,
            glassIntensity, setGlassIntensity
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => useContext(PreferencesContext);
