/* eslint-disable @typescript-eslint/no-var-requires */
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const serve = require('electron-serve');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
/* eslint-enable @typescript-eslint/no-var-requires */

// Initialize store for persistent settings
const store = new Store();

// Load Next.js app in production, or connect to dev server
const loadURL = isDev
  ? () => mainWindow.loadURL('http://localhost:3000')
  : serve({ directory: path.join(__dirname, '../.next') });

// Keep a reference to mainWindow to prevent it from being garbage collected
let mainWindow;

// Set up auto updater
function setupAutoUpdater() {
  // Disable auto downloading of updates
  autoUpdater.autoDownload = false;

  // Check for updates on startup (in production only)
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }

  // Listen for update events
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version of CTRL is available. Do you want to download it now?',
      buttons: ['Yes', 'No']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'A new version has been downloaded. Restart the application to apply the updates.',
      buttons: ['Restart', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('Error updating application:', err);
  });
}

function createMainWindow() {
  // Get saved window dimensions, or use defaults
  const windowState = store.get('windowState', {
    width: 1280,
    height: 800,
    x: undefined,
    y: undefined,
  });

  // Create the browser window
  mainWindow = new BrowserWindow({
    title: 'CTRL - No-Code/Low-Code App Builder',
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1a1a1a', // Dark background to match app theme
    titleBarStyle: 'hiddenInset', // Nice clean title bar on macOS
    frame: process.platform !== 'darwin', // Frameless on macOS
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true,
      devTools: isDev,
      sandbox: false
    },
    icon: path.join(__dirname, '../public/icon.png'),
    show: false // Don't show until ready-to-show
  });

  // Show when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Handle maximization state
    if (store.get('isMaximized')) {
      mainWindow.maximize();
    }
  });

  // Save window state when it's closed
  const saveWindowState = () => {
    if (!mainWindow.isMaximized()) {
      const bounds = mainWindow.getBounds();
      store.set('windowState', {
        ...bounds,
      });
    }
    store.set('isMaximized', mainWindow.isMaximized());
  };

  // Save window state periodically and at close
  const windowStateKeeper = setInterval(() => {
    if (mainWindow) saveWindowState();
  }, 10000);
  
  mainWindow.on('close', () => {
    clearInterval(windowStateKeeper);
    saveWindowState();
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in detached mode in dev
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    loadURL(mainWindow);
  }

  // Create menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new-project'),
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu-open-project'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu-save-as'),
        },
        { type: 'separator' },
        {
          label: 'Export',
          submenu: [
            {
              label: 'Export as React',
              click: () => mainWindow.webContents.send('menu-export', 'react'),
            },
            {
              label: 'Export as React Native',
              click: () => mainWindow.webContents.send('menu-export', 'react-native'),
            },
            {
              label: 'Export as Flutter',
              click: () => mainWindow.webContents.send('menu-export', 'flutter'),
            },
            {
              label: 'Export as SwiftUI',
              click: () => mainWindow.webContents.send('menu-export', 'swift'),
            },
          ],
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Design Mode',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow.webContents.send('menu-switch-mode', 'design'),
        },
        {
          label: 'Logic Mode',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow.webContents.send('menu-switch-mode', 'logic'),
        },
        {
          label: 'Code Mode',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow.webContents.send('menu-switch-mode', 'code'),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
      ],
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin'
          ? [{ type: 'separator' }, { role: 'front' }]
          : [{ role: 'close' }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://github.com/ctrl-app/docs'),
        },
        {
          label: 'Report an Issue',
          click: () => shell.openExternal('https://github.com/ctrl-app/ctrl/issues'),
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            if (!isDev) {
              autoUpdater.checkForUpdates();
            } else {
              dialog.showMessageBox({
                type: 'info',
                title: 'Development Mode',
                message: 'Auto-updates are disabled in development mode.',
                buttons: ['OK']
              });
            }
          }
        }
      ],
    },
  ];

  // Add app menu on macOS
  if (process.platform === 'darwin') {
    menuTemplate.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Handle window events
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external URLs in the default browser
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// App lifecycle events
app.whenReady().then(() => {
  createMainWindow();
  setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// IPC handlers for renderer to main process communication
ipcMain.handle('open-file-dialog', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'CTRL Projects', extensions: ['ctrl', 'json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  return filePaths.length > 0 ? filePaths[0] : null;
});

ipcMain.handle('save-file-dialog', async (_, defaultPath) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'CTRL Projects', extensions: ['ctrl'] },
      { name: 'JSON', extensions: ['json'] },
    ],
  });
  return filePath;
});

// Handle export dialog
ipcMain.handle('export-dialog', async (_, options) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: `Export as ${options.format}`,
    defaultPath: options.defaultPath,
    filters: [
      { name: options.format === 'react' ? 'React Project' : 
             options.format === 'react-native' ? 'React Native Project' : 
             options.format === 'flutter' ? 'Flutter Project' : 'SwiftUI Project', 
        extensions: ['zip'] }
    ],
  });
  return filePath;
});

// Handle messages from renderer
ipcMain.handle('show-message', (_, options) => {
  dialog.showMessageBox(mainWindow, {
    type: options.type || 'info',
    title: options.title || 'CTRL',
    message: options.message,
    detail: options.detail,
    buttons: options.buttons || ['OK']
  });
});

// Handle app version request
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Add IPC handlers for window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.on('set-drag-region', (_, enabled) => {
  if (mainWindow) {
    if (enabled) {
      mainWindow.setMovable(true);
    } else {
      mainWindow.setMovable(false);
    }
  }
}); 