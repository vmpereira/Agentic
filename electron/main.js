const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function startPythonBackend() {
  const pythonExecutable = 'python';
  const backendMain = path.join(__dirname, '../backend/main.py');
  
  console.log(`[Electron Main] Spawning FastAPI backend process...`);
  pythonProcess = spawn(pythonExecutable, [backendMain], {
    cwd: path.join(__dirname, '../backend'),
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[FastAPI stdout]: ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[FastAPI stderr]: ${data.toString().trim()}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    title: 'Extractor PDF → Excel',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const devUrl = 'http://localhost:3000';

  mainWindow.loadURL(devUrl).catch(() => {
    console.log('[Electron Main] Next.js dev server not detected on port 3000. Loading fallback...');
    mainWindow.loadURL(`data:text/html,
      <html>
        <body style="background-color:#0f172a;color:#f8fafc;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;">
          <h2 style="color:#60a5fa;">Extractor PDF &rarr; Excel Shell</h2>
          <p>Next.js dev server is starting or not running on <code>http://localhost:3000</code>.</p>
          <p style="font-size:13px;color:#94a3b8;">Run <code>npm run dev</code> inside <code>frontend/</code> and then reload (Ctrl+R).</p>
        </body>
      </html>
    `);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


app.whenReady().then(() => {
  startPythonBackend();
  createWindow();

  ipcMain.handle('dialog:openExcel', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Seleccionar archivo Excel existente (Append)',
      properties: ['openFile'],
      filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
    });
    if (!canceled && filePaths.length > 0) {
      return filePaths[0];
    }
    return null;
  });

  ipcMain.handle('dialog:saveExcel', async (event, defaultFileName) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Crear nuevo archivo Excel (Save As)',
      defaultPath: defaultFileName || 'Registros_Facturas_2026.xlsx',
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
    });
    if (!canceled && filePath) {
      return filePath;
    }
    return null;
  });


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
