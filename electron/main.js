const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// -----------------------------------------------------------------------------
// 0. Single Instance Lock
// -----------------------------------------------------------------------------
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    console.log("Another instance is already running. Quitting this instance.");
    app.quit();
    return; // Stop execution
}

// Global references
let mainWindow;
let splashWindow;
let backendProcess = null; // We might want to track this more formally
let isQuitting = false;

// Config
const isDev = !app.isPackaged;
const isPortable = !!process.env.PORTABLE_EXECUTABLE_DIR;
const userDataPath = isPortable
    ? path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'GPTK-Data')
    : app.getPath('userData');
const stateFilePath = path.join(userDataPath, 'window-state.json');

// Ensure data directory exists (needed for portable mode)
if (isPortable && !fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

// -----------------------------------------------------------------------------
// AUTO-UPDATER CONFIGURATION
// -----------------------------------------------------------------------------
const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024; // 5 MB max log file size
if (isPortable) {
    log.transports.file.resolvePathFn = () => path.join(userDataPath, 'logs', 'main.log');
}
autoUpdater.logger = log;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// -----------------------------------------------------------------------------
// GLOBAL ERROR HANDLERS — catch unhandled errors and write to log file
// -----------------------------------------------------------------------------
process.on('uncaughtException', (error) => {
    log.error('[CRASH] Uncaught Exception:', error.stack || error.message || error);
});

process.on('unhandledRejection', (reason) => {
    log.error('[CRASH] Unhandled Promise Rejection:', reason?.stack || reason?.message || reason);
});

// Persistent update state
let updateState = { status: 'idle', version: '', percent: 0, transferred: 0, total: 0 };
let isUserDownloading = false; // Flag to distinguish user-initiated downloads

function sendUpdateState() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-status-changed', { ...updateState });
    }
}

function logUpdate(msg) {
    log.info(`[AutoUpdater] ${msg}`);
    console.log(`[AutoUpdater] ${msg}`);
}

function setupAutoUpdater() {
    if (isDev) {
        logUpdate('Skipping in dev mode');
        return;
    }

    autoUpdater.on('checking-for-update', () => {
        logUpdate('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
        logUpdate(`Update available: ${info.version}`);
        // Only set status to available if user hasn't started downloading
        if (!isUserDownloading) {
            updateState = { status: 'available', version: info.version, percent: 0, transferred: 0, total: 0 };
            sendUpdateState();
        }
    });

    autoUpdater.on('update-not-available', () => {
        logUpdate('App is up to date.');
        // Notify renderer so "Check for Updates" can show feedback
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update-status-changed', { status: 'uptodate' });
        }
    });

    autoUpdater.on('download-progress', (progress) => {
        logUpdate(`Download: ${Math.round(progress.percent)}% (${progress.transferred}/${progress.total})`);
        updateState.status = 'downloading';
        updateState.percent = Math.round(progress.percent);
        updateState.transferred = progress.transferred;
        updateState.total = progress.total;
        sendUpdateState();
    });

    autoUpdater.on('update-downloaded', (info) => {
        logUpdate(`Update downloaded: ${info.version}`);
        isUserDownloading = false;
        updateState = { status: 'ready', version: info.version, percent: 100, transferred: 0, total: 0 };
        sendUpdateState();
    });

    autoUpdater.on('error', (err) => {
        logUpdate(`Error: ${err.stack || err.message || err}`);
        isUserDownloading = false;
        if (updateState.status === 'downloading' && updateState.version) {
            updateState.status = 'available';
            updateState.percent = 0;
            updateState.transferred = 0;
            updateState.total = 0;
            sendUpdateState();
        }
    });

    // Check for updates after a short delay
    setTimeout(() => {
        logUpdate('Starting initial update check...');
        autoUpdater.checkForUpdates().catch(err => {
            logUpdate(`Initial check failed: ${err.message}`);
        });
    }, 5000);
}

// IPC: Renderer queries current update state
ipcMain.handle('get-update-status', () => {
    return { ...updateState };
});

// IPC: Renderer requests to start downloading the update
ipcMain.on('start-download', () => {
    logUpdate('User clicked Download Now');
    isUserDownloading = true;
    updateState.status = 'downloading';
    updateState.percent = 0;
    sendUpdateState();

    logUpdate('Calling autoUpdater.downloadUpdate()...');
    autoUpdater.downloadUpdate()
        .then((paths) => {
            logUpdate(`downloadUpdate() resolved. Paths: ${JSON.stringify(paths)}`);
        })
        .catch(err => {
            logUpdate(`downloadUpdate() FAILED: ${err.stack || err.message || err}`);
            isUserDownloading = false;
            updateState.status = 'available';
            updateState.percent = 0;
            sendUpdateState();
        });
});

// IPC: Renderer requests to cancel the download
ipcMain.on('cancel-download', () => {
    logUpdate('User cancelled download');
    isUserDownloading = false;
    updateState.status = 'available';
    updateState.percent = 0;
    updateState.transferred = 0;
    updateState.total = 0;
    sendUpdateState();
});

// IPC: Renderer requests to install the update and restart
ipcMain.on('install-update', () => {
    logUpdate('User requested install. Showing overlay and toast...');
    // Save current version before update so we can detect post-update
    const versionFile = path.join(app.getPath('userData'), 'pre-update-version.txt');
    try { fs.writeFileSync(versionFile, app.getVersion()); } catch (e) { /* ignore */ }

    // Send installing state so renderer shows full-screen overlay
    updateState.status = 'installing';
    sendUpdateState();

    // Fire a Windows toast notification that persists after app closes
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
        const toast = new Notification({
            title: 'Updating GPTK Library Manager',
            body: `Installing v${updateState.version}... The app will reopen automatically. Please don't turn off your computer.`,
            icon: path.join(__dirname, '../assets/icons/College_icon.ico'),
            silent: true
        });
        toast.show();
    }

    // Give the renderer 2.5s to show the overlay, then quit and install
    setTimeout(() => {
        isQuitting = true;
        autoUpdater.quitAndInstall(false, true); // Non-silent: shows NSIS progress bar (pages skipped by installer.nsh)
    }, 2500);
});

// IPC: Renderer requests to manually check for updates
ipcMain.on('manual-check-updates', () => {
    logUpdate('User manually checking for updates...');
    autoUpdater.checkForUpdates().catch(err => {
        logUpdate('Manual check failed: ' + err.message);
        // Notify renderer of check failure
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update-status-changed', { status: 'check-error' });
        }
    });
});

// Post-update detection: renderer pulls this data on startup
ipcMain.handle('check-post-update', async () => {
    const versionFile = path.join(app.getPath('userData'), 'pre-update-version.txt');
    try {
        if (!fs.existsSync(versionFile)) return null;
        const oldVersion = fs.readFileSync(versionFile, 'utf8').trim();
        const currentVersion = app.getVersion();
        // Clean up the file immediately
        fs.unlinkSync(versionFile);
        if (oldVersion === currentVersion) return null;
        logUpdate(`Post-update detected: ${oldVersion} → ${currentVersion}`);

        // Kill any leftover mshta loading screens
        try { exec('taskkill /f /im mshta.exe', { stdio: 'ignore' }); } catch (e) { /* ignore */ }

        // Fetch release notes from GitHub
        const https = require('https');
        const releaseNotes = await new Promise((resolve) => {
            const url = 'https://api.github.com/repos/kotresh75/GPT-Kampli-Library-Management-System/releases/latest';
            https.get(url, { headers: { 'User-Agent': 'GPTK-Library-Manager' } }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const release = JSON.parse(data);
                        resolve({
                            version: release.tag_name || `v${currentVersion}`,
                            body: release.body || 'Bug fixes and improvements.',
                            name: release.name || `Version ${currentVersion}`
                        });
                    } catch {
                        resolve({ version: `v${currentVersion}`, body: 'Bug fixes and improvements.', name: `Version ${currentVersion}` });
                    }
                });
            }).on('error', () => {
                resolve({ version: `v${currentVersion}`, body: 'Bug fixes and improvements.', name: `Version ${currentVersion}` });
            });
        });
        return releaseNotes;
    } catch (e) {
        logUpdate(`Post-update check error: ${e.message}`);
        return null;
    }
});

// -----------------------------------------------------------------------------
// ERROR LOGGING & BUG REPORT IPC HANDLERS
// -----------------------------------------------------------------------------

// IPC: Renderer forwards frontend errors to the main log file
ipcMain.on('log-renderer-error', (_event, errorData) => {
    const { msg, url, line, col, stack } = errorData || {};
    log.error(`[RENDERER] ${msg || 'Unknown error'}`, {
        source: url ? `${url}:${line}:${col}` : 'unknown',
        stack: stack || 'no stack'
    });
});

// IPC: Return the log file path so the UI can show it
ipcMain.handle('get-log-path', () => {
    return log.transports.file.getFile().path;
});

// IPC: Open an external URL in the default browser
ipcMain.on('open-external-url', (_event, url) => {
    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
        shell.openExternal(url);
    }
});


// -----------------------------------------------------------------------------
// 1. Splash Window
// -----------------------------------------------------------------------------
function createSplashWindow(mode = 'startup') {
    if (splashWindow) return; // Already exists

    splashWindow = new BrowserWindow({
        width: 400,
        height: 500,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true, // For simple IPC in splash
            contextIsolation: false
        },
        icon: path.join(__dirname, '../assets/icons/College_icon.ico'),
    });

    const splashPath = path.join(__dirname, 'splash.html');
    splashWindow.loadFile(splashPath, { query: { mode: mode } });

    splashWindow.on('closed', () => {
        splashWindow = null;
    });
}

// -----------------------------------------------------------------------------
// 2. Main Window
// -----------------------------------------------------------------------------
function createWindow() {
    // Load window state
    let state = { width: 1200, height: 800, maximized: true };
    try {
        if (fs.existsSync(stateFilePath)) {
            const savedState = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
            if (savedState) state = savedState;
        }
    } catch (e) {
        console.error("Failed to load window state", e);
    }

    mainWindow = new BrowserWindow({
        width: state.width,
        height: state.height,
        x: state.x,
        y: state.y,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        titleBarStyle: 'hidden',
        show: false, // Wait until ready
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../assets/icons/College_icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (state.maximized) {
        mainWindow.maximize();
    }

    // Load App
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../frontend/build/index.html'));
    }

    // Show window when ready and close splash
    mainWindow.once('ready-to-show', () => {
        // slight delay to ensure smooth transition
        setTimeout(() => {
            mainWindow.show();
            if (splashWindow) {
                splashWindow.close();
            }
        }, 500);
    });

    // Handle external links (target="_blank") to open in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    // Renderer process crash detection
    mainWindow.webContents.on('render-process-gone', (_event, details) => {
        log.error(`[CRASH] Renderer process gone! Reason: ${details.reason}, exitCode: ${details.exitCode}`);
    });

    mainWindow.webContents.on('crashed', (_event, killed) => {
        log.error(`[CRASH] Renderer crashed! Killed: ${killed}`);
    });

    // -------------------------------------------------------------------------
    // Shutdown & Backup Logic Handlers
    // -------------------------------------------------------------------------

    // Intercept Close Event
    mainWindow.on('close', (e) => {
        if (isQuitting) return; // Already going through shutdown process

        e.preventDefault(); // Stop window from closing immediately

        // 1. Bring up Splash in "Shutdown" mode
        createSplashWindow('shutdown');
        mainWindow.hide(); // Hide main app

        // 2. Add extra delay for UX (user sees "Backing up...") 
        // and trigger backend backup check
        setTimeout(() => {
            if (backendProcess) {
                console.log("[Main] Requesting graceful shutdown/backup from Backend...");
                // Send signal to backend
                // Since backend is running in the same process group or we need a way to talk to it.
                // NOTE: 'startBackend' just does require() in the same process in the original code? 
                // Ah, the original code does `require(path.join(backendPath, 'server.js'));`
                // This means backend is running IN THE MAIN PROCESS.
                // We can use process.emit or a global event emitter, OR if it's in main process, 
                // we can just call a function if we had access, but `require` doesn't return the app instance easily.

                // BEST APPROACH for "Same Process" Backend:
                // We will rely on `process.on('message')` pattern we added to server.js
                // But wait, `process.on('message')` works for child processes. 
                // If we ran `require('server.js')`, it shares the same `process` object?
                // Yes. So `process.emit('message', 'shutdown_request')` might work if we listen for it.
                // BUT `requestSingleInstanceLock` behaves weirdly with process events sometimes.

                // Let's rely on the fact that we are in the same process.
                // We will use a custom IPC event to itself or just `process.emit`.
                process.emit('graceful-exit-request');
            } else {
                // Backend not running? Just quit.
                performQuit();
            }
        }, 500);
    });

    // Save state logic
    mainWindow.on('close', saveState);

    function saveState() {
        if (!mainWindow) return;
        // Don't save if minimized to tray or hidden, only if valid
        try {
            const bounds = mainWindow.getBounds();
            const isMaximized = mainWindow.isMaximized();
            const newState = {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
                maximized: isMaximized
            };
            fs.writeFileSync(stateFilePath, JSON.stringify(newState));
        } catch (e) {
            console.error("Failed to save window state", e);
        }
    }
}

function performQuit() {
    isQuitting = true;
    app.exit(0);
}

// -----------------------------------------------------------------------------
// 3. Backend Management
// -----------------------------------------------------------------------------
function startBackend() {
    const backendPath = isDev
        ? path.join(__dirname, '../backend')
        : path.join(process.resourcesPath, 'backend');

    console.log("Starting backend from:", backendPath);

    try {
        process.chdir(backendPath);

        // Update module paths
        const Module = require('module');
        const backendNodeModules = path.join(backendPath, 'node_modules');
        if (!module.paths.includes(backendNodeModules)) {
            module.paths.unshift(backendNodeModules);
        }

        process.env.NODE_ENV = isDev ? 'development' : 'production';
        process.env.USER_DATA_PATH = userDataPath;

        // Start Server
        // We use 'require' so it runs in THIS process. 
        require(path.join(backendPath, 'server.js'));
        backendProcess = true; // Flag that it's running

        // Listen for the "Done" signal from backend if we implement it, 
        // OR just assume it's up.
        // For robustness, let's wait a second before showing main window to let DB connect.
        setTimeout(() => {
            createWindow();
            if (!isPortable) {
                setupAutoUpdater(); // Check for updates after app is ready (skip in portable mode)
            }
        }, 2500);

    } catch (err) {
        console.error("Failed to start backend:", err);
        if (splashWindow) {
            splashWindow.webContents.send('update-status', 'Error: Failed to start backend.');
        }
    }
}

// -----------------------------------------------------------------------------
// 4. App Lifecycle
// -----------------------------------------------------------------------------
app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

app.on('ready', () => {
    createSplashWindow('startup');

    // Small delay to let splash render
    setTimeout(() => {
        startBackend();
    }, 500);
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

// Listener for Backend 'Ready to Quit' signal
// We will modify server.js to emit this when backup is done
// Listener for Backend 'Ready to Quit' signal
// We will modify server.js to emit this when backup is done
process.on('backend-exit-completed', (status) => {
    console.log("[Main] Backend finished cleanup. Quitting.");

    // If we have a splash window open (which we should in shutdown mode)
    // and backup was actually performed, update the UI instead of quitting immediately
    if (splashWindow && status && status.performed) {
        splashWindow.webContents.send('backup-result', status);
    } else {
        performQuit();
    }
});

// Listener for Splash "OK" button
ipcMain.on('splash-done', () => {
    performQuit();
});

// IPC handlers for Title Bar
ipcMain.on('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    }
});
ipcMain.on('window-close', () => { if (mainWindow) mainWindow.close(); });

// External Link Handling
ipcMain.on('open-external', (event, url) => {
    shell.openExternal(url);
});

// Printer Handling
ipcMain.handle('get-printers', async () => {
    if (!mainWindow) return [];
    try {
        return await mainWindow.webContents.getPrintersAsync();
    } catch (e) {
        console.error("Failed to get printers:", e);
        return [];
    }
});

// Scanner Handling (HID Discovery)
ipcMain.handle('get-scanners', async () => {
    return new Promise((resolve) => {
        // Get all HID devices that are OK, then aggressively filter out non-scanners
        const cmd = `powershell "Get-PnpDevice -Class HIDClass -Status OK | Select-Object -ExpandProperty FriendlyName"`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("Scanner Scan Error:", error);
                resolve([]);
                return;
            }

            // Exclusion list — common HID devices that are NOT barcode scanners
            const excludePatterns = [
                // Mice & Touchpads
                /mouse/i, /touchpad/i, /trackpad/i, /pointing/i, /trackball/i, /touchscreen/i,
                // Keyboards
                /keyboard/i,
                // Game controllers
                /game/i, /xbox/i, /joystick/i, /gamepad/i, /controller/i,
                // System/Internal devices
                /system/i, /radio/i, /event filter/i, /portable device/i,
                /converted/i, /consumer control/i, /vendor-defined/i,
                /device control/i, /collection/i, /compliant/i,
                // Audio & Media
                /audio/i, /headset/i, /media/i, /volume/i, /speaker/i, /microphone/i,
                // Camera/Webcam (not barcode scanner)
                /webcam/i, /camera/i, /ir /i, /sensor/i,
                // Fingerprint & Biometric
                /fingerprint/i, /biometric/i,
                // Power / Battery
                /battery/i, /power/i, /ups/i, /wireless/i,
                // Pen / Stylus
                /pen/i, /stylus/i, /tablet/i, /wacom/i, /digitizer/i,
                // Generic
                /virtual/i, /remote/i
            ];

            // Inclusion patterns — known scanner brand keywords
            const scannerBrands = [
                /honeywell/i, /zebra/i, /datalogic/i, /symbol/i, /motorola/i,
                /opticon/i, /intermec/i, /cognex/i, /sick/i, /keyence/i,
                /unitech/i, /cino/i, /argox/i, /mindeo/i, /newland/i,
                /barcode/i, /scanner/i, /reader/i, /scan/i, /pos/i, /wand/i
            ];

            const lines = stdout.split('\r\n')
                .map(l => l.trim())
                .filter(l => l.length > 0);

            const filtered = lines.filter(device => {
                // Always include if it matches a known scanner brand
                if (scannerBrands.some(p => p.test(device))) return true;
                // Exclude known non-scanner devices
                if (excludePatterns.some(p => p.test(device))) return false;
                // Include remaining unknown HID devices (could be scanners)
                return true;
            });

            resolve([...new Set(filtered)]);
        });
    });
});

// Silent Print Handling with Advanced Options
ipcMain.handle('print-silent', async (event, content, options = {}) => {
    return new Promise((resolve, reject) => {
        const printWindow = new BrowserWindow({
            show: false,
            webPreferences: { nodeIntegration: true }
        });

        // Create a data URI to load the content
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(content);
        printWindow.loadURL(dataUrl);

        printWindow.webContents.on('did-finish-load', () => {
            // Map frontend options to Electron print settings
            // Default 0 margins (customizable via options)
            // marginsType: 0 - default, 1 - none, 2 - minimum

            const printSettings = {
                silent: true,
                deviceName: options.deviceName || '',
                printBackground: options.printBackground !== false, // Default true
                landscape: !!options.landscape,
                color: options.color !== false, // Default true
                margins: options.margins || { marginType: 0 },
                scaleFactor: options.scaleFactor || 100,
                pagesPerSheet: options.pagesPerSheet || 1,
                collate: !!options.collate,
                copies: options.copies || 1,
                pageRanges: options.pageRanges || [], // [{from: 0, to: 1}]
                duplexMode: options.duplexMode, // 'simplex', 'longEdge', 'shortEdge'
                dpi: options.dpi
            };

            printWindow.webContents.print(printSettings, (success, errorType) => {
                if (!success) console.error("Print Failed:", errorType);
                printWindow.close();
                resolve(success);
            });
        });
    });
});

// PDF Generation Handling
ipcMain.handle('print-to-pdf', async (event, content, options = {}) => {
    return new Promise((resolve, reject) => {
        const printWindow = new BrowserWindow({
            show: false,
            webPreferences: { nodeIntegration: true }
        });

        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(content);
        printWindow.loadURL(dataUrl);

        printWindow.webContents.on('did-finish-load', async () => {
            try {
                // Map options to printToPDF options
                const pdfOptions = {
                    landscape: !!options.landscape,
                    displayHeaderFooter: false,
                    printBackground: options.printBackground !== false,
                    scale: (options.scaleFactor || 100) / 100,
                    pageSize: options.pageSize || 'A4',
                    margins: {
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    }
                    // We can add more mapping if needed
                };

                // If margins are passed as object Use them
                if (options.margins && typeof options.margins === 'object' && options.margins.top !== undefined) {
                    pdfOptions.margins = options.margins;
                }

                const data = await printWindow.webContents.printToPDF(pdfOptions);
                printWindow.close();
                resolve(data.toString('base64')); // Return as base64 string
            } catch (error) {
                console.error("PDF Generation Failed:", error);
                printWindow.close();
                reject(error);
            }
        });
    });
});
