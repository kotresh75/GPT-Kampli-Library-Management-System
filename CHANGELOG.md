# Changelog

## [1.0.1] - 2026-03-10

### Added
- **Smart Polling for Backend Startup (`electron/main.js`)**: Replaced hardcoded `3.5s` artificial delays with a dynamic smart-polling mechanism. The Electron app now pings the backend every `100ms` and opens the main window the exact millisecond the backend is ready, significantly decreasing the app startup time on modern PCs while maintaining safety for slower/older hardware.
- **Focus-On-Top UX (`electron/main.js`)**: Added temporary `setAlwaysOnTop(true)` behavior when the main window appears after the splash screen finishes. This guarantees the Library System opens forcefully above all other background applications (like browsers or IDEs).
- **Centralized API Config (`frontend/src/config/apiConfig.js`)**: Created a single source of truth for the backend URL (`API_BASE`).

### Fixed
- **Production Kannada Font Bug (`frontend/public/fonts.css`)**: Fixed a critical Electron packaging issue where custom fonts failed to load because `fonts.css` used absolute paths (`url('/fonts/...')`), which incorrectly resolved to the root `C:/` drive in production (`file:///`). Rewrote all 90+ declarations to use relative paths (`url('./fonts/...')`).
- **Missing Kannada Fonts**: Added the missing `@font-face` definitions and `woff2` font files for `Noto Serif Kannada` (`400` and `700` weights) in `fonts.css` so the `Alt+F` fallback toggle functions perfectly in production without relying on pre-installed Windows fonts.
- **`http` Module Crash**: Fixed a crash on the splash screen caused by a missing `const http = require('http');` import in `electron/main.js` during the implementation of the smart polling feature.

### Changed
- **Frontend URL Refactoring**: Replaced over 185 instances of hardcoded `http://localhost:17221` strings across 52 frontend React files (Pages, Components, Contexts) with dynamic imports using the new centralized `API_BASE` variable. This future-proofs the application for deployment to different ports or cloud environments.
- **Main Process Port Config**: Extracted the hardcoded backend port (`17221`) in `electron/main.js` into an easy-to-change `BACKEND_PORT` constant at the top of the file.
- **Code Formatting**: Cleaned up duplicate comment blocks regarding the `backend-exit-completed` shutdown process in `main.js`.
