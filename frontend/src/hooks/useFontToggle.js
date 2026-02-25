import { useEffect } from 'react';

const DEFAULT_FONT_BASE = "'Outfit', 'Noto Sans', 'Noto Sans Kannada', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const ALTERNATE_FONT_BASE = "'Times New Roman', 'Noto Serif Kannada', serif";

const LS_KEY = 'gptk_font_toggle';

/**
 * Applies the given font stack to:
 *  1. The --font-family-base CSS variable on <html>  (for all var() references)
 *  2. document.body.style.fontFamily directly         (forces Kannada fallback re-evaluation)
 */
const applyFont = (fontStack) => {
    document.documentElement.style.setProperty('--font-family-base', fontStack);
    document.body.style.fontFamily = fontStack;
};

/**
 * useFontToggle
 *
 * Global keyboard shortcuts:
 *   Alt+F — Toggle primary font between Outfit stack and Times New Roman + Noto Serif Kannada
 *   Alt+H — Toggle Electron DevTools (no-op in browser)
 *
 * Font preference is saved to localStorage and restored on reload.
 */
const useFontToggle = () => {
    useEffect(() => {
        // Restore saved font preference on mount
        const saved = localStorage.getItem(LS_KEY);
        applyFont(saved === 'alternate' ? ALTERNATE_FONT_BASE : DEFAULT_FONT_BASE);

        const handleKeyDown = (e) => {
            // Alt+F — Toggle primary font
            if (e.altKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                const current = localStorage.getItem(LS_KEY) || 'default';
                const next = current === 'alternate' ? 'default' : 'alternate';
                applyFont(next === 'alternate' ? ALTERNATE_FONT_BASE : DEFAULT_FONT_BASE);
                localStorage.setItem(LS_KEY, next);
                console.log(
                    `[FontToggle] → ${next === 'alternate' ? 'Times New Roman + Noto Serif Kannada' : 'Outfit (default)'}`
                );
            }

            // Alt+H — Toggle DevTools (Electron only)
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                if (window.electron?.openDevTools) {
                    window.electron.openDevTools();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
};

export default useFontToggle;
