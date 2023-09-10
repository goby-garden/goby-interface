const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // @ts-ignore
  // send_message: (message) => ipcRenderer.send('send_message', message)
  open_dialog:async (action)=>{
    return ipcRenderer.invoke('open_dialog', action);
  },
  open_project:async (file_path,is_new)=>{
    return ipcRenderer.invoke('open_project', file_path, is_new);
  },
  ready:async ()=>{
    return ipcRenderer.invoke('ready');
  },
  write_to_database: async (command,args)=>{
    return ipcRenderer.invoke('write_to_database',command,args);
  }
})

