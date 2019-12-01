//Главный файл программы. Здесь находиться вход
import { app, BrowserWindow,Menu,Tray,ipcMain, net } from 'electron'
const functions = require("./functions");
functions.restoreSettings();
const ps = require('ps-node');
const restoreDesktop = require("./restoreDesktop");
const network = require("./network");
const fs = require("fs");
const rimraf = require("rimraf");
network();//инициализируем сеть



if(!app.requestSingleInstanceLock()){//если мы не единственный запущенный экземпляр программы
  app.quit();
}

//получаем аргументы запуска
let startAgr = process.argv[1];
let startWindows = startAgr == "-start";


console.log(network.socket); 
network.startConnection();//пытаемся подключиться к сети, которая сохранена в настройках


if(startWindows){//с запуском виндовс проверяем, что мы можем сделать
  console.log("-start");
  let settings = functions.getSettings();
  functions.restoreSettings();
  if(settings.startRestore){
    console.log("Start Restore");
    restoreDesktop(settings.defaultDesktop);
    if(settings.clearDownloads){
      functions.clearDownloads();
    }
  }
}
/*let nodePath = process.argv[0];
let appPath = process.argv[1];
let name = process.argv[2];
let age = process.argv[3];
let show = ((process.argv[2] == "-start"||process.argv[2] == "-start" || process.argv[3] == "-start") ? false : true);
*/
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  
  mainWindow = new BrowserWindow({
    show: false,
    minHeight: 420,
    useContentSize: true,
    minWidth: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true, // add this
      devTools:false //инструменты разработчика
    }
  });
  require("./ipc")(mainWindow,app,network);//стартуем ipc
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
  });

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
let tray = null;
app.on('ready', () =>{ 
  console.log("создаём иконку в трее");
  let iconPath = process.env.NODE_ENV === 'development'
  ? __dirname+'/icon.ico'
  : __dirname+'/static/icon.ico'
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
      {label: 'Restore Desktop', click() { 
        console.log('open window!');
        if(mainWindow == null) createWindow();
        else mainWindow.show();
      } },
      { type: 'separator' },
      { label: 'Восстановить раб. стол', click() { 
        console.log('restore desktop!');
        let settings = functions.getSettings();
        restoreDesktop(settings.defaultDesktop);
      } },
      { label: 'Сохранить раб. стол', click() { 
        console.log('save desktop!');
        if(mainWindow == null) createWindow();
        else mainWindow.show();
        mainWindow.webContents.send('fast-travel', 'save');//в App.vue
        
      } },
      { type: 'separator' },
      { label: 'Настройки', click() { 
        console.log('settings!');
        if(mainWindow == null) createWindow();
        else mainWindow.show();
        mainWindow.webContents.send('fast-travel', 'settings');//в App.vue
      } },
      { label: 'Выйти из программы', click() { 
        let settings = functions.getSettings();
        if(settings.password && settings.server){
          console.log('Need pass to exit app!');
          if(mainWindow == null) createWindow();
          else mainWindow.show();
          mainWindow.webContents.send('fast-travel', 'exit');//в App.vue
        }else{
          console.log('exit app!');
          app.quit();
        }
        
      } },
  ])
  tray.setToolTip('Restore Desktop')
  tray.setContextMenu(contextMenu)
  console.log("иконка создана");

  if(!startWindows){
    createWindow();
  }else{mainWindow = null;}
});

app.on('window-all-closed', () => {
  mainWindow == null;
  /*if (process.platform !== 'darwin') {
    app.quit()
  }*/
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
