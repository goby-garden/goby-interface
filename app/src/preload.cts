import type {ItemRelationSide, Property} from 'goby-database/dist/types';
import type Project from 'goby-database';

const { contextBridge, ipcRenderer } = require('electron')


const electronAPI={
    // electron context management invocations
    open_dialog:async (action:'save' | 'locate file')=>{
      console.log('preload - open_dialog')
      return ipcRenderer.invoke('open_dialog', action);
    },
    ready:async ()=>{
      return ipcRenderer.invoke('ready');
    },
    open_project:async (file_path:string,is_new:boolean)=>{
      return ipcRenderer.invoke('open_project', file_path, is_new);
    },
    // goby-database invocations
    get_workspace: async ():Promise<ReturnType<Project["retrieve_workspace_contents"]>>=>{
      return ipcRenderer.invoke('get_workspace')
    },
    retrieve_class_items:async (cls:Parameters<Project["retrieve_class_items"]>[0]):Promise<ReturnType<Project["retrieve_class_items"]>> =>{
      return ipcRenderer.invoke('retrieve_class_items',cls);
    },
    edit_relations:async (relations:Parameters<Project["action_edit_relations"]>[0])=>{
      return ipcRenderer.invoke('edit_relations',relations);
    },
  };

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI;