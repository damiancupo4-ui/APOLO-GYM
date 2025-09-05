const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  loadGymData: () => ipcRenderer.invoke('load-gym-data'),
  saveGymData: (data) => ipcRenderer.invoke('save-gym-data', data),
  getDataPath: () => ipcRenderer.invoke('get-data-path')
});