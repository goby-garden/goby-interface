const { contextBridge, ipcRenderer } = require('electron')


const electronAPI={
    open_dialog:async (action:'save' | 'locate file')=>{
      console.log('preload - open_dialog')
      return ipcRenderer.invoke('open_dialog', action);
    },
    get_workspace: async ()=>{
      return ipcRenderer.invoke('get_workspace')
    },
    open_project:async (file_path:string,is_new:boolean)=>{
      return ipcRenderer.invoke('open_project', file_path, is_new);
    },
    ready:async ()=>{
      return ipcRenderer.invoke('ready');
    }
  };

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI;