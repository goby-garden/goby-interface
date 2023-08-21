const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // @ts-ignore
  send_message: (message) => ipcRenderer.send('send_message', message)
})

