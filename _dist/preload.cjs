"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { contextBridge, ipcRenderer } = require('electron');
const electronAPI = {
    open_dialog: async (action) => {
        console.log('preload - open_dialog');
        return ipcRenderer.invoke('open_dialog', action);
    },
    get_workspace: async () => {
        return ipcRenderer.invoke('get_workspace');
    },
    get_class_meta: async (class_id) => {
        return ipcRenderer.invoke('get_class_meta', class_id);
    },
    open_project: async (file_path, is_new) => {
        return ipcRenderer.invoke('open_project', file_path, is_new);
    },
    get_relation_options: async (property) => {
        return ipcRenderer.invoke('get_relation_options', property);
    },
    make_relations: async (relations) => {
        return ipcRenderer.invoke('make_relations', relations);
    },
    ready: async () => {
        return ipcRenderer.invoke('ready');
    }
};
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
