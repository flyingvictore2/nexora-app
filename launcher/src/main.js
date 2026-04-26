const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  Tray,
  Menu,
  nativeImage,
  session,
} = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const NEXORA_URL = 'https://frontend-ashen-eta-86.vercel.app';
const SPLASH_DURATION = 2000; // ms before checking updates in dev

let mainWindow = null;
let splashWindow = null;
let tray = null;
let isQuitting = false;

// ─── Window position persistence ─────────────────────────────────────────────
let windowState = { x: undefined, y: undefined, width: 1400, height: 900 };

try {
  const Store = require('electron-store');
  const store = new Store();
  const saved = store.get('windowState');
  if (saved) windowState = { ...windowState, ...saved };

  app.on('before-quit', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const bounds = mainWindow.getBounds();
      store.set('windowState', bounds);
    }
  });
} catch (e) {
  // electron-store not available, use defaults
}

// ─── Splash window ───────────────────────────────────────────────────────────
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  splashWindow.loadFile(path.join(__dirname, 'renderer', 'splash.html'));
  splashWindow.setMenu(null);
}

// ─── Main window ─────────────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 1024,
    minHeight: 680,
    frame: false,
    backgroundColor: '#0a0a0a',
    show: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // allow loading Vercel app
    },
  });

  mainWindow.setMenu(null);
  mainWindow.loadURL(NEXORA_URL);

  // Inject custom titlebar + draggable region after page loads
  mainWindow.webContents.on('did-finish-load', () => {
    injectTitlebar();

    // Show main window, close splash
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.webContents.send('update-status', { status: 'launching' });
      setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
        mainWindow.show();
        mainWindow.focus();
      }, 600);
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    console.error('Page failed to load:', code, desc);
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'error.html'));
  });

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Fullscreen shortcut
  mainWindow.webContents.on('before-input-event', (_e, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
    if (input.key === 'F5' && input.type === 'keyDown') {
      mainWindow.webContents.reload();
    }
  });
}

// ─── Inject custom title bar into the web app ─────────────────────────────────
function injectTitlebar() {
  const css = `
    #_nx_bar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 30px !important;
      z-index: 2147483647 !important;
      -webkit-app-region: drag;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 0 12px 0 16px !important;
      background: linear-gradient(to bottom, rgba(10,10,10,0.85), transparent) !important;
      pointer-events: none !important;
    }
    #_nx_bar * { pointer-events: all !important; }
    #_nx_bar_logo {
      font-size: 11px !important;
      font-weight: 900 !important;
      letter-spacing: 3px !important;
      color: #e50914 !important;
      -webkit-app-region: drag;
      user-select: none !important;
      font-family: sans-serif !important;
    }
    #_nx_bar_controls {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      -webkit-app-region: no-drag;
    }
    #_nx_bar_controls button {
      width: 12px !important;
      height: 12px !important;
      border-radius: 50% !important;
      border: none !important;
      cursor: pointer !important;
      padding: 0 !important;
      transition: opacity 0.15s !important;
      opacity: 0.8 !important;
    }
    #_nx_bar_controls button:hover { opacity: 1 !important; transform: scale(1.15) !important; }
    #_nx_btn_close  { background: #ff5f57 !important; }
    #_nx_btn_min    { background: #febc2e !important; }
    #_nx_btn_max    { background: #28c840 !important; }
  `;

  const js = `
    (function() {
      if (document.getElementById('_nx_bar')) return;
      const bar = document.createElement('div');
      bar.id = '_nx_bar';
      bar.innerHTML = \`
        <span id="_nx_bar_logo">NEXORA</span>
        <div id="_nx_bar_controls">
          <button id="_nx_btn_min"  title="Minimizar"></button>
          <button id="_nx_btn_max"  title="Maximizar"></button>
          <button id="_nx_btn_close" title="Cerrar"></button>
        </div>
      \`;
      document.body.appendChild(bar);

      document.getElementById('_nx_btn_close').onclick = () => window._nx?.close();
      document.getElementById('_nx_btn_min').onclick   = () => window._nx?.minimize();
      document.getElementById('_nx_btn_max').onclick   = () => window._nx?.maximize();
    })();
  `;

  mainWindow.webContents.insertCSS(css);
  mainWindow.webContents.executeJavaScript(js).catch(() => {});
}

// ─── System tray ─────────────────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, '..', 'assets', 'tray.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('Nexora');

  const menu = Menu.buildFromTemplate([
    { label: 'Abrir Nexora', click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { type: 'separator' },
    { label: `Versión ${app.getVersion()}`, enabled: false },
    { label: 'Buscar actualizaciones', click: () => autoUpdater.checkForUpdatesAndNotify() },
    { type: 'separator' },
    { label: 'Salir', click: () => { isQuitting = true; app.quit(); } },
  ]);

  tray.setContextMenu(menu);
  tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus(); });
}

// ─── Auto-updater ─────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;

  const send = (payload) => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.webContents.send('update-status', payload);
    }
  };

  autoUpdater.on('checking-for-update', () => send({ status: 'checking' }));

  autoUpdater.on('update-available', (info) => {
    send({ status: 'downloading', version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    send({ status: 'launching' });
    createMainWindow();
  });

  autoUpdater.on('download-progress', (p) => {
    send({
      status: 'progress',
      percent: Math.round(p.percent),
      transferred: formatBytes(p.transferred),
      total: formatBytes(p.total),
      speed: formatBytes(p.bytesPerSecond) + '/s',
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    send({ status: 'installing', version: info.version });
    setTimeout(() => autoUpdater.quitAndInstall(true, true), 2500);
  });

  autoUpdater.on('error', (err) => {
    console.error('Updater error:', err.message);
    send({ status: 'launching' });
    createMainWindow();
  });

  autoUpdater.checkForUpdates().catch((err) => {
    console.warn('Update check failed (offline?):', err.message);
    send({ status: 'launching' });
    createMainWindow();
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.restore();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => { mainWindow?.hide(); });
ipcMain.on('window-quit', () => { isQuitting = true; app.quit(); });
ipcMain.handle('app-version', () => app.getVersion());

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // Single instance lock
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) { app.quit(); return; }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  createSplashWindow();
  createTray();

  splashWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      if (app.isPackaged) {
        setupAutoUpdater();
      } else {
        // Dev mode: skip update check
        splashWindow.webContents.send('update-status', { status: 'launching' });
        createMainWindow();
      }
    }, SPLASH_DURATION);
  });
});

app.on('activate', () => {
  if (!mainWindow) createMainWindow();
  else { mainWindow.show(); mainWindow.focus(); }
});

app.on('before-quit', () => { isQuitting = true; });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
