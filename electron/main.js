const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load React App
    // In dev, we can wait for localhost:3000 (React)
    // For now, we assume React is running on 3000
    mainWindow.loadURL('http://localhost:3000');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function startbackend() {
    const backendPath = path.join(__dirname, '../backend/server.js');
    console.log("Starting backend from:", backendPath);
    serverProcess = spawn('node', [backendPath], {
        cwd: path.join(__dirname, '../backend'),
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'], // Enable IPC for graceful shutdown
        windowsHide: true
    });

    serverProcess.on('error', (err) => {
        console.error('Failed to start backend:', err);
    });
}

app.on('ready', () => {
    startbackend();
    // Give backend a moment to start, then window
    setTimeout(createWindow, 2000);
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

let isQuitting = false;

app.on('before-quit', (e) => {
    // If we haven't stopped the backend yet, prevent quit and stop it
    if (serverProcess && !isQuitting) {
        e.preventDefault();
        isQuitting = true; // Prevent infinite loop

        console.log("Terminating backend Process and waiting for graceful shutdown...");

        // Use IPC for reliable shutdown on Windows
        if (serverProcess.send) {
            serverProcess.send('shutdown');
        } else {
            serverProcess.kill('SIGTERM');
        }

        // Wait for backend to close
        serverProcess.on('close', (code) => {
            console.log(`Backend exited with code ${code}`);
            app.quit(); // Quit for real this time
        });

        // Force quit if backend hangs (e.g. 15 seconds)
        setTimeout(() => {
            console.error("Backend shutdown timed out. Forcing quit.");
            app.quit();
        }, 15000);
    }
});
