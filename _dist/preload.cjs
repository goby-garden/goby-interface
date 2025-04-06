"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { contextBridge, ipcRenderer } = require('electron');
const electronAPI = {
    open_dialog: async (action) => {
        console.log('preload - open_dialog');
        return ipcRenderer.invoke('open_dialog', action);
    },
    open_project: async (file_path, is_new) => {
        return ipcRenderer.invoke('open_project', file_path, is_new);
    },
    ready: async () => {
        return ipcRenderer.invoke('ready');
    }
};
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
