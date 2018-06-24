import { app, BrowserWindow } from 'electron'
import { Wechaty } from 'wechaty';

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
    height: 563,
    width: 1000,
    minHeight: 563,
    minWidth: 1000,
    maxHeight: 563,
    maxWidth:1000,
    resizable: false,
    maximizable:false,
    useContentSize: true
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
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


//  服务
const express = require('express');
const router = express.Router();
const bodyParser= require('body-parser');

// Wechaty.instance() // Global Instance
// .on('scan', (qrcode, status) => console.log(`Scan QR Code to login: ${status}\n${qrcode}`))
// .on('login',            user => console.log(`User ${user} logined`))
// .on('message',       message => console.log(`Message: ${message}`))
// .start()

var appServer = express();
appServer.use(bodyParser.json({limit:'50mb'}));
appServer.use(bodyParser.urlencoded({ limit:'50mb', extended: false }));
var server = appServer.listen(8989, function() {
    console.log('服务启动...');
});

router.post('/abc',(req,res)=>{
  try{

  }catch(e){
    return res.json({
      result: 'error',
      data: [],
      msg: '失败'
    });
  }
})

appServer.use('/',router);