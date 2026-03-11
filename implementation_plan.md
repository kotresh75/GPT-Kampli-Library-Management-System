# Goal Description

The objective is to create a lightweight "Performance Review Widget" that the user can toggle at any time by pressing `Alt+G`. 

This widget will display critical, real-time metrics about the application's performance, fully utilizing Electron's native capabilities to gather hardware statistics:
- **FPS (Frames Per Second)**: Render speed of the React UI.
- **CPU Usage**: System-wide or App-specific processing load.
- **GPU Usage**: Graphics processing load (if available via Electron).
- **RAM / Memory**: Active memory footprint of the App.
- **Backend Latency (Ping)**: Response time of the local SQLite API.

The overlay will be a non-intrusive floating glassmorphism card so the user can check performance without leaving their current screen.

## Proposed Changes

### Electron Main Process
#### [MODIFY] [main.js](file:///f:/GPTK%20Library%20Management%20System/electron/main.js)
- Add IPC wrapper for `app.getAppMetrics()` to gather memory and CPU usage of all Electron processes (Main, Renderer, GPU).
- Expose these metrics to the React frontend via a new `ipcMain.handle('get-system-metrics')` endpoint.

### Frontend Components
#### [NEW] `frontend/src/components/common/PerformanceWidget.js`
- Create a React component that renders as a fixed, draggable overlay (or fixed corner).
- Use `requestAnimationFrame` to calculate an accurate, real-time UI **FPS** counter natively in the browser.
- Use `setInterval` (e.g., every 1000ms) to ping the IPC backend for CPU, RAM, and GPU stats, and the Express backend for API latency.
- It will unmount or pause polling when hidden via `Alt+G` to prevent background drain.

#### [MODIFY] [App.js](file:///f:/GPTK%20Library%20Management%20System/frontend/src/App.js) 
- Add a global keyboard event listener (`useEffect`) for `Alt+G`.
- Import `<PerformanceWidget />` and manage its visibility state (`showPerformanceWidget`).

### Preload Script
#### [MODIFY] [electron/preload.js](file:///f:/GPTK%20Library%20Management%20System/electron/preload.js) (if it exists, otherwise define in [main.js](file:///f:/GPTK%20Library%20Management%20System/electron/main.js) with context isolation)
- Ensure the frontend can securely call `window.electronAPI.getSystemMetrics()` without Node integration vulnerabilities.

## Verification Plan

### Manual Verification
1. Boot the frontend and backend.
2. Press `Alt+G` from anywhere in the app.
3. Verify the widget slides into view.
4. Check that **FPS** constantly updates (targeting ~60fps).
5. Check that **CPU**, **RAM**, and **GPU** memory usage updates every second.
6. Press `Alt+G` again to hide it and verify polling stops safely.
