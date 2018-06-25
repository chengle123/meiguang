import { app, BrowserWindow } from 'electron'

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
    useContentSize: true,
    webPreferences: {webSecurity: false}
  })

  mainWindow.setMenu(null)
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
// const express = require('express');
// const router = express.Router();
// const bodyParser= require('body-parser');
let io = require('socket.io')(8990);
const Wechat = require('wechat4u');
const fs = require('fs');
const path = require('path');
const extend = require('node.extend');

let USERDATA_PATH = app.getPath('userData');
let bot = new Wechat();
let configs = {};

io.on('connection', function(socket) {
  // 获取二维码登录
  socket.on('wxLogin', function(data) {
    try{
        if (bot.PROP.uin) {
            // 存在登录数据时，可以随时调用restart进行重启
            bot.restart();
        } else {
            bot.start();
            bot.on('uuid', uuid => {
              io.sockets.emit('wxLogin', {
                  result: 'success',
                  data: {url:'https://login.weixin.qq.com/qrcode/' + uuid},
                  msg: '二维码获取成功'
              });
            });
        }
    }catch(e){
        io.sockets.emit('wxLogin', {
            result: 'error',
            data: [],
            msg: '二维码获取失败'
        });
    }
  });
  // 确认微信配置
  socket.on('queryWX', function(data) {
    try{
        configs = extend(configs, data);
        if(configs.wxPassFriend){
          bot.on('message', msg => {
            if (msg.MsgType == bot.CONF.MSGTYPE_VERIFYMSG) {
              bot.verifyUser(msg.RecommendInfo.UserName, msg.RecommendInfo.Ticket)
              .then(res => {
                io.sockets.emit('wxPassFriend', {
                    result: 'success',
                    data: {name:bot.Contact.getDisplayName(msg.RecommendInfo)},
                    msg: '好友确认通过'
                });
              })
              .catch(err => {
                
              })
            }
          })
        }
        io.sockets.emit('queryWX', {
            result: 'success',
            data: [],
            msg: '微信配置成功'
        });
    }catch(e){
        io.sockets.emit('queryWX', {
            result: 'error',
            data: [],
            msg: '微信配置失败'
        });
    }
  });
  // 开始发单
  socket.on('startRelease', function(data) {
    try{
        configs = extend(configs, data);
        io.sockets.emit('release', {
            result: 'success',
            data: [],
            msg: '定时发单启动成功'
        });
    }catch(e){
        io.sockets.emit('release', {
            result: 'error',
            data: [],
            msg: '定时发单启动失败'
        });
    }
  });
  // 停止发单
  socket.on('endRelease', function() {
    try{
        //=============???????????
        io.sockets.emit('release', {
            result: 'success',
            data: [],
            msg: '已经停止发单'
        });
    }catch(e){
        io.sockets.emit('release', {
            result: 'error',
            data: [],
            msg: '停止发单失败'
        });
    }
  });
  var userAvatar;
  bot.on('user-avatar', avatar => {
    userAvatar = avatar;
  })
  bot.on('login', () => {
      var contacts = bot.contacts;
      var contact = [];
      for(var key in contacts){
        if(contacts[key].ContactFlag == 0 && contacts[key].MemberList.length>0){
          contact.push(contacts[key]);
        }
      }
      io.sockets.emit('user-avatar', {
          result: 'success',
          data: {
            url: userAvatar,
            userName: bot.user.NickName,
            contacts: contact
          },
          msg: '登录成功'
      });
  })
  
})

// var appServer = express();
// appServer.use(bodyParser.json({limit:'50mb'}));
// appServer.use(bodyParser.urlencoded({ limit:'50mb', extended: false }));
// var server = appServer.listen(8989, function() {
//     console.log('服务启动...');
// });

// router.post('/getUuid',(req,res)=>{
//     try{
//         if (bot.PROP.uin) {
//             // 存在登录数据时，可以随时调用restart进行重启
//             bot.restart();
//         } else {
//             bot.start();
//             bot.on('uuid', uuid => {
//                     console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
//             });
//         }
//     }catch(e){
//         return res.json({
//             result: 'error',
//             data: [],
//             msg: '失败'
//         });
//     }
// })

// appServer.use('/',router);