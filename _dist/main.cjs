"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
let Project;
app.whenReady()
    .then(() => {
    create_window({ type: 'home' });
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0)
            create_window({ type: 'home' });
    });
});
app.on('window-all-closed', function () {
    console.log('hey did someone turn off the lights? (all the windows closed)');
    // if (process.platform !== 'darwin') app.quit()
});
// window event handlers ==================
ipcMain.handle('open_dialog', async function (event, action) {
    let dialog_output;
    switch (action) {
        case 'save':
            dialog_output = dialog.showSaveDialogSync({
                title: 'Choose the name and save location for your project',
                // message:'Choose the name and location for your project',
                buttonLabel: 'Create',
                nameFieldLabel: 'Project name:',
                properties: [
                    'showOverwriteConfirmation'
                ]
            });
            dialog_output = dialog_output?.replace(/\.[^/.]+$/, '');
            if (dialog_output)
                dialog_output = dialog_output + '.db';
            break;
        case 'locate file':
            dialog_output = dialog.showOpenDialogSync({
                filters: [
                    { name: 'Custom File Type', extensions: ['db'] }
                ]
            });
            if (dialog_output)
                dialog_output = dialog_output[0];
            break;
    }
    return dialog_output;
});
// ipcMain.handle('open_project', async function(event,file_path,is_new){
//     if(!Project) Project= await import('goby-database').then(goby => goby.default);
//     project=new Project(file_path)
//     project_name=path.basename(file_path);
//     if(is_new){
//       console.log('new project')
//       // create workspace window
//       project.action_config_window('workspace',1)
//     }
//     // remove all old windows
//     for(let win of BrowserWindow.getAllWindows()){
//       win.close();
//     }
//     //fetch windows, open those which are set as 'open'
//     windows=project.retrieve_windows();
//     for(let win of windows.filter(a=>a.open)){
//       let options={
//         type:win.type,
//         size:win.metadata.size
//       }
//       console.log(options);
//       if(win.metadata.pos) options.pos=win.metadata.pos;
//       let win_instance=create_window(options);
//       win.instance_id=win_instance.webContents.id;
//       let move_throttle;
//       let resize_throttle;
//       win_instance.on('move',function(){
//         clearTimeout(move_throttle);
//         move_throttle = setTimeout(function(){
//           let pos=win_instance.getPosition();
//           win.metadata.pos=pos;
//           project.action_config_window('workspace',1,win.metadata,win.id)
//         }, 100);
//       })
//       win_instance.on('resize',function(){
//         clearTimeout(resize_throttle);
//         resize_throttle = setTimeout(function(){
//           let size=win_instance.getSize();
//           win.metadata.size=size;
//           project.action_config_window('workspace',1,win.metadata,win.id)
//         }, 100);
//       })
//     }
//     //(eventually) update home page to display data
//   });
function create_window({ type, pos, size }) {
    const defaults = {
        home: {
            size: [540, 150],
            min_size: [540, 150]
        },
        dropper: {
            size: [300, 400],
            min_size: [300, 400]
        },
        workspace: {
            size: [1000, 900],
            min_size: [570, 400]
        }
    };
    let pos_obj = pos ? { x: pos[0], y: pos[1] } : {};
    let options = {
        width: size ? size[0] : defaults[type].size[0],
        height: size ? size[1] : defaults[type].size[1],
        minWidth: defaults[type].min_size[0],
        minHeight: defaults[type].min_size[1],
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 10, y: 8 },
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            sandbox: false,
            nodeIntegration: true
        },
        ...pos_obj
    };
    let subdirectory = type == 'home' ? '' : type + '/';
    const win = new BrowserWindow(options);
    if (process.env.NODE_ENV !== 'development') {
        // Load production build
        win.loadFile(`${__dirname}/_dist/interface/${subdirectory}.html`);
    }
    else {
        // Load vite dev server page 
        console.log('Development mode');
        // win.webContents.openDevTools({ mode: 'detach'});
        win.loadURL(`http://localhost:5173/${subdirectory}`);
    }
    return win;
}
