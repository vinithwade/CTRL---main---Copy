/* eslint-disable @typescript-eslint/no-var-requires */
const { contextBridge, ipcRenderer } = require('electron');
/* eslint-enable @typescript-eslint/no-var-requires */

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // File operations
    openFile: async () => ipcRenderer.invoke('open-file-dialog'),
    saveFile: async (defaultPath) => ipcRenderer.invoke('save-file-dialog', defaultPath),
    exportProject: async (options) => ipcRenderer.invoke('export-dialog', options),
    
    // Menu events
    onMenuEvent: (channel, callback) => {
      const validChannels = [
        'menu-new-project',
        'menu-open-project',
        'menu-save',
        'menu-save-as',
        'menu-export',
        'menu-switch-mode'
      ];
      if (validChannels.includes(channel)) {
        // Remove any existing listeners to avoid duplicates
        ipcRenderer.removeAllListeners(channel);
        // Add new listener
        ipcRenderer.on(channel, (_, ...args) => callback(...args));
      }
    },
    
    // Dialog
    showMessage: async (options) => ipcRenderer.invoke('show-message', options),
    
    // App info
    platform: process.platform,
    getVersion: async () => ipcRenderer.invoke('get-app-version'),
    
    // Window controls (for custom title bar)
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    isMaximized: async () => ipcRenderer.invoke('window-is-maximized'),
    
    // Drag region for custom title bar
    setDragRegion: (enabled) => ipcRenderer.send('set-drag-region', enabled)
  }
); 