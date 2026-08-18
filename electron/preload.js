const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectExcelFile: () => ipcRenderer.invoke('dialog:openExcel'),
  selectSaveExcelFile: (defaultFileName) => ipcRenderer.invoke('dialog:saveExcel', defaultFileName),
  getBackendPort: () => 8000,
});
