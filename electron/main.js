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
        stdio: 'inherit', // Keep output in the main terminal for debugging
        windowsHide: true // Prevent a new console window from popping up
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

app.on('will-quit', () => {
    if (serverProcess) {
        console.log("Terminating backend Process...");
        serverProcess.kill('SIGTERM');
    }
});
