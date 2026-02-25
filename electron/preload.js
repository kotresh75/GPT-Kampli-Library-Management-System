const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron', {
    windowControl: {
        minimize: () => ipcRenderer.send('window-minimize'),
        maximize: () => ipcRenderer.send('window-maximize'),
        close: () => ipcRenderer.send('window-close')
    },
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    getScanners: () => ipcRenderer.invoke('get-scanners'),
    printSilent: (content, printerName) => ipcRenderer.invoke('print-silent', content, printerName),
    printToPDF: (content, options) => ipcRenderer.invoke('print-to-pdf', content, options),
    openExternal: (url) => ipcRenderer.send('open-external', url),
    openDevTools: () => ipcRenderer.send('open-devtools'),

    // Error Logging & Bug Report API
    logError: (errorData) => ipcRenderer.send('log-renderer-error', errorData),
    getLogPath: () => ipcRenderer.invoke('get-log-path'),
    openExternalUrl: (url) => ipcRenderer.send('open-external-url', url),

    // Auto-Update API
    getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
    onUpdateStatusChanged: (callback) => ipcRenderer.on('update-status-changed', (_event, state) => callback(state)),
    checkPostUpdate: () => ipcRenderer.invoke('check-post-update'),
    manualCheckUpdates: () => ipcRenderer.send('manual-check-updates'),
    startDownload: () => ipcRenderer.send('start-download'),
    cancelDownload: () => ipcRenderer.send('cancel-download'),
    installUpdate: () => ipcRenderer.send('install-update'),
    removeUpdateListeners: () => {
        ipcRenderer.removeAllListeners('update-status-changed');
    }
});
