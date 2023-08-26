// This file is the entry point for the Electron application
const path = require('path');
const Database = require('better-sqlite3');
const Project = require('goby-database');
console.log(Project);


let project;

const { app, BrowserWindow,ipcMain,Menu,dialog } = require('electron')

// .on('set-title', handleSetTitle)

function create_window() {
  const win = new BrowserWindow({
    // 540
    width: 540,
    height: 150,
    minWidth:540,
    minHeight:150,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 10, y: 8 },
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
        // win.webContents.openDevTools();
        win.loadURL('http://localhost:5173/')
  }
 
}

ipcMain.handle('open_dialog', async function(event,action){
  // console.log(event.sender,type);
  let dialog_output;

  switch(action){
    case 'save':
      dialog_output=dialog.showSaveDialogSync({
        title:'Choose the name and save location for your project',
        // message:'Choose the name and location for your project',
        buttonLabel:'Create',
        nameFieldLabel:'Project name:',
        properties:[
          'showOverwriteConfirmation'
        ]
      },event.sender)
      dialog_output=dialog_output?.replace(/\.[^/.]+$/,'');
      if(dialog_output) dialog_output=dialog_output+'.db';
    break;
    case 'locate file':
      dialog_output=dialog.showOpenDialogSync({filters:[
        { name: 'Custom File Type', extensions: ['db'] }
      ]},event.sender)
      
      if(dialog_output) dialog_output=dialog_output[0]
    break;
  }

  

  

  return dialog_output;
});

ipcMain.handle('open_project', async function(event,file_path){
  // console.log(event.sender,type);
  project=new Project(file_path)

  
  
  // return dialog_output;
});

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


