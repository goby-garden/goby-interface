"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { contextBridge, ipcRenderer } = require('electron');
const electronAPI = {
    // electron context management invocations
    open_dialog: async (action) => {
        console.log('preload - open_dialog');
        return ipcRenderer.invoke('open_dialog', action);
    },
    ready: async () => {
        return ipcRenderer.invoke('ready');
    },
    open_project: async (file_path, is_new) => {
        return ipcRenderer.invoke('open_project', file_path, is_new);
    },
    // goby-database invocations
    get_workspace: async () => {
        return ipcRenderer.invoke('get_workspace');
    },
    retrieve_class_items: async (cls) => {
        return ipcRenderer.invoke('retrieve_class_items', cls);
    },
    edit_relations: async (relations) => {
        return ipcRenderer.invoke('edit_relations', relations);
    },
};
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
