const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');

// Ruta donde se guardarán los datos
const DATA_FOLDER = 'c:\\Users\\damia\\OneDrive\\Escritorio\\apolo';
const DATA_FILE = path.join(DATA_FOLDER, 'apolo-gym-data.json');

let mainWindow;

// Crear la carpeta si no existe
async function ensureDataFolder() {
  try {
    if (!existsSync(DATA_FOLDER)) {
      await fs.mkdir(DATA_FOLDER, { recursive: true });
      console.log(`Carpeta creada: ${DATA_FOLDER}`);
    }
  } catch (error) {
    console.error('Error creando carpeta:', error);
  }
}

// Cargar datos desde el archivo
async function loadData() {
  try {
    if (existsSync(DATA_FILE)) {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error cargando datos:', error);
    return null;
  }
}

// Guardar datos en el archivo
async function saveData(data) {
  try {
    await ensureDataFolder();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('Datos guardados en:', DATA_FILE);
    return true;
  } catch (error) {
    console.error('Error guardando datos:', error);
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Opcional: agregar icono
    title: 'APOLO GYM - Sistema de Gestión',
    show: false
  });

  // En desarrollo, cargar desde el servidor de Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar desde los archivos construidos
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  ensureDataFolder();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers para comunicación con el renderer
ipcMain.handle('load-gym-data', async () => {
  return await loadData();
});

ipcMain.handle('save-gym-data', async (event, data) => {
  return await saveData(data);
});

ipcMain.handle('get-data-path', () => {
  return DATA_FILE;
});