// This file is the entry point for the Electron application
const path = require('path');
const Project = require('goby-database');
console.log(Project);

const { app, BrowserWindow,ipcMain } = require('electron')

// .on('set-title', handleSetTitle)

function create_window() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox:false,
      nodeIntegration:true
    }
  })

  if (process.env.NODE_ENV !== 'development') {
        // Load production build
        win.loadFile(`${__dirname}/../_dist/index.html`)
  } else {
        // Load vite dev server page 
        console.log('Development mode')
        win.webContents.openDevTools();
        win.loadURL('http://localhost:5173/')
  }

  ipcMain.on('send_message', receive_message);
}

app.whenReady()
  .then(() => {
    create_window()
    
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) create_window()
    })
  })

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


function receive_message(event,msg){
  console.log(msg);
}