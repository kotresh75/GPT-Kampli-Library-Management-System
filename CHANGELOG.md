# Changelog

## [1.0.3] - 25/03/2026

### Added
- **Unified Image Service (`backend/services/imageService.js`)**: Extended previous `coverService.js` with generic `saveBase64AsWebP()`, `deleteImageFile()`, `clearDirectory()`, `getFilesForBackup()`, and `restoreFilesFromBackup()` methods supporting all image subdirectories (`covers/`, `students/`, `signatures/`).
- **Frontend Image Helpers (`frontend/src/utils/imageUtils.js`)**: Added `getStudentPhotoUrl()` and `getSignatureUrl()` helpers that resolve local WebP file paths to full URLs, with backward-compatible base64 fallback.
- **Migration Script (`backend/scripts/migrateImages.js`)**: Idempotent script to convert existing base64 data in the database to WebP files. Run: `node backend/scripts/migrateImages.js`.

### Changed
- **Student Photo Uploads**: Photos are now converted to optimized WebP files (`Uploads/students/<register_no>.webp`) instead of storing raw base64 in the database. ~90% storage savings.
- **HOD Signatures**: Saved as `Uploads/signatures/hod_<dept_name>.webp` instead of base64 in departments table.
- **Principal Signature**: Saved as `Uploads/signatures/principal.webp` instead of base64 in system_settings table.
- **Student Deletion Cleanup**: Single and bulk student deletion now removes associated photo files from disk.
- **Department Deletion Cleanup**: Deleting a department removes the associated HOD signature file.
- **Backup Format (v1.2)**: Backups now include `student_images[]` and `signature_images[]` alongside `cover_images[]`. Backward compatible with v1.1/v1.0 backups.
- **Frontend Components Updated**: `SmartStudentTable`, `StudentDetailModal`, `IDCardTemplate`, `IDCardPreviewModal`, `BulkIDCardDownload` all resolve images through the new helpers.

## [1.0.2] - 25/03/2026

### Added
- **Offline Book Cover Images**: Book cover images are now downloaded and stored locally as optimized WebP files in `Uploads/covers/`, enabling offline display without internet dependency.
- **Cover Download Service (`backend/services/coverService.js`)**: New service that downloads external cover images from Google Books / Open Library, converts them to WebP format using `sharp` (75% quality, max 300px width), and manages local file storage.
- **Cover API Routes (`backend/routes/coverRoutes.js`)**: New endpoints `POST /api/covers/download` and `POST /api/covers/download-batch` for single and bulk cover downloads.
- **Static File Serving (`backend/server.js`)**: Added `/uploads` static route to serve locally stored cover images and other uploaded files.
- **Image Utility Helper (`frontend/src/utils/imageUtils.js`)**: Shared `getBookCoverUrl()` function that resolves local paths or URLs, and `downloadCoverImage()` for frontend-triggered downloads.

### Changed
- **Auto-Fill Enhancement (`SettingsPage.js`)**: Data enrichment auto-fill now downloads cover images locally via the backend instead of only storing external URLs.
- **ISBN Lookup Enhancement (`SmartAddBookModal.js`)**: Adding books via ISBN lookup now downloads covers locally before saving.
- **Cover Image Display**: Updated 6 components (`SmartBookTable`, `SmartBookDetailModal`, `BookCard`, `IssueTab`, `ReturnTab`, `FinesTab`) to use `getBookCoverUrl()` helper for consistent local/URL resolution.
- **Backup Format (v1.1)**: Local backups now include cover image files (base64-encoded) under `cover_images[]` array, making backups fully self-contained. Backward compatible with v1.0 backups.
- **Book Deletion Cleanup**: Deleting books (single or bulk) now removes associated cover image files from disk.

### Dependencies
- Added `sharp` npm package for high-performance image processing and WebP conversion.

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
