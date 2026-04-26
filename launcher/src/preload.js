const { contextBridge, ipcRenderer } = require('electron');

// Exposed to the renderer process (splash.html)
contextBridge.exposeInMainWorld('launcher', {
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (_event, data) => callback(data));
  },
  getVersion: () => ipcRenderer.invoke('app-version'),
});

// Exposed to the main Nexora web app (injected as window._nx)
contextBridge.exposeInMainWorld('_nx', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),
  quit:     () => ipcRenderer.send('window-quit'),
  platform: process.platform,
  version:  () => ipcRenderer.invoke('app-version'),
});
