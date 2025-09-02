import type {ItemRelationSide, Property} from 'goby-database/dist/types';

const { contextBridge, ipcRenderer } = require('electron')


const electronAPI={
    open_dialog:async (action:'save' | 'locate file')=>{
      console.log('preload - open_dialog')
      return ipcRenderer.invoke('open_dialog', action);
    },
    get_workspace: async ()=>{
      return ipcRenderer.invoke('get_workspace')
    },
    get_class_meta: async (class_id:number)=>{
      return ipcRenderer.invoke('get_class_meta',class_id)
    },
    open_project:async (file_path:string,is_new:boolean)=>{
      return ipcRenderer.invoke('open_project', file_path, is_new);
    },
    get_relation_options:async (property:Property)=>{
      return ipcRenderer.invoke('get_relation_options',property)
    },
    make_relations:async (relations:[input_1:ItemRelationSide,input_2:ItemRelationSide][])=>{
      return ipcRenderer.invoke('make_relations',relations);
    },
    ready:async ()=>{
      return ipcRenderer.invoke('ready');
    }
  };

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI;