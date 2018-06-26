import { app, BrowserWindow } from 'electron'

const http = require('http');
const querystring = require('querystring');
const request = require('request')
let io = require('socket.io')(8990);
const Wechat = require('wechat4u');
const fs = require('fs');
const path = require('path');
const extend = require('node.extend');

let USERDATA_PATH = app.getPath('userData');
let bot = new Wechat();

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
    bot.stop();
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

const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';//debug
log.info('App starting...');

autoUpdater.autoDownload = false;

function sendStatusToWindow(msg) {
  log.info(msg);
  const webContentList = webContents.getAllWebContents();
  webContentList.map(w => {
    w.send('update-download-progress', msg);
  });
}

// 发现一个可用更新
autoUpdater.on('update-available', info => {
  dialog.showMessageBox({
    type: 'info',
    title: '更新提示',
    message: `发现可用更新: v${info.version}，点击更新下载?`,
    buttons: ['更新', '忽略']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

// 更新下载完成
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: '安装更新',
    message: '更新包下载完成，确认重启软件并安装...',
    buttons: ['确认']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      log.info('update-downloaded');
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  });
});

// 下载进度
autoUpdater.on('download-progress', (progressObj) => {
  const log_message = [
    'Download speed:' + progressObj.bytesPerSecond,
    'Downloaded:' + progressObj.percent + '%',
    progressObj.transferred +' / '+ progressObj.total,
  ];
  log.info(`download-progress: ${progressObj.percent}`);
  mainWindow.setProgressBar(progressObj.percent/100)
  sendStatusToWindow(log_message.join('\n'));
});

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});


//  服务
// const express = require('express');
// const router = express.Router();
// const bodyParser= require('body-parser');

let configs = {
  userAvatar:'',
  mgPid:'',
  wxPassFriend:'',
  wxContacts:'',
  chosenList:[],
  second:150,
  invitationCode: 'ZCMVPZR',
  sendImg: false,
  textTemplate:
`【商品名称】{商品名称}
【原价】{商品价格}元
【优惠券】{券价格}元
【券后价】{券后价格}元
【领券口令】{淘口令}
【推荐理由】{商品文案}
复制这条消息，打开 “手机淘宝” 即可领券`,
};
let timeing;

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

  // 确认文案配置
  socket.on('queryText', function(data) {
    try{
        configs = extend(configs, data);
        io.sockets.emit('queryText', {
            result: 'success',
            data: [],
            msg: '文案配置成功'
        });
    }catch(e){
        io.sockets.emit('queryText', {
            result: 'error',
            data: [],
            msg: '文案配置失败'
        });
    }
  });

  // 获取商品
  socket.on('getGoodsList', ()=>{
    try{
      var req = http.request({
        hostname: 'app.sitezt.cn',
        method: 'GET',
        path: '/api/xsqgh5?para='
      }, function (res) {
          var dataText = '';
          res.setEncoding('utf8'); 
          res.on('data', function (chunk) {
              dataText += chunk;
          }); 
          res.on('end', function () {
            let data = JSON.parse(dataText).List;
            let arr = [];
            for(var i = 0; i< data.length; i++){
              if(data[i].ListItem){
                data[i].ListItem.map(item=>{
                  arr.push(item);
                });
              }
            }
            io.sockets.emit('getGoodsList', {
                result: 'success',
                data: arr,
                msg: '商品列表获取成功'
            });
          }); 
      });
      req.on('error', function (e) {
        io.sockets.emit('getGoodsList', {
            result: 'error',
            data: [],
            msg: '商品列表获取失败'
        });
      }); 
      req.end();
    }catch(e){
      io.sockets.emit('getGoodsList', {
          result: 'error',
          data: [],
          msg: '商品列表获取失败'
      });
    }
  });

  // 已选中商品
  socket.on('setChosenList', (data)=>{
    try{
      configs = extend(configs, data);
      io.sockets.emit('setChosenList', {
          result: 'success',
          data: configs.chosenList,
          msg: '选中商品列表获取成功'
      });
    }catch(e){
      io.sockets.emit('setChosenList', {
          result: 'error',
          data: [],
          msg: '选中商品列表获取失败'
      });
    }
  });

  // 开始发单
  socket.on('startRelease', function(data) {
    try{
      configs = extend(configs, data);
      timerFn();
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
      clearTimeout(timeing);
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
  
  bot.on('user-avatar', avatar => {
    configs.userAvatar = avatar;
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
            url: configs.userAvatar,
            userName: bot.user.NickName,
            contacts: contact
          },
          msg: '登录成功'
      });
  })

  function timerFn(){
    var alreadyArr = [];
    var notArr = [];
    var command,miniUrl;
    configs.chosenList.map(item=>{
      if(!item.GoodsType){
        notArr.push(item);
      }else{
        alreadyArr.push(item);
      }
    });
    if(notArr.length == 0){
      clearTimeout(timeing);
      return;
    }
    var reqUrl = http.request({
        hostname: 'api.ft12.com',
        method: 'GET',
        path: '/api.php?url='+'http://mk.xichegg.com/AppCms/index.html?ui=http%3A%2F%2Fcdn.temzt.cn%2FAppCms%2FUI%2Fsharedetail.html&token=b9961385b4e64ad8b637e3bdf1d1a331&itemid='+notArr[0].ItemId+'&invitecode='+configs.invitationCode
      }, function (res) {
          var dataText = '';
          res.setEncoding('utf8'); 
          res.on('data', function (chunk) {
              dataText += chunk;
          }); 
          res.on('end', function () {
            miniUrl = dataText;
          }); 
      });
      reqUrl.end();
    var req = http.request({
          hostname: 'app.sitezt.cn',
          method: 'POST',
          path: '/api/itemdetail',
          headers: {    
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'    
          } 
      }, function (res) {
        var dataText = '';
        res.setEncoding('utf8'); 
        res.on('data', function (chunk) {
            dataText += chunk;
        }); 
        res.on('end', function () {
          command = JSON.parse(dataText).tkl;
          var text = configs.textTemplate.replace('{商品名称}',notArr[0].ShowTitle)
                                          .replace('{商品价格}',notArr[0].ShowPrice*100/10000)
                                          .replace('{券价格}',notArr[0].QuanAmount*100/10000)
                                          .replace('{券后价格}',(notArr[0].ShowPrice - notArr[0].QuanAmount)*100/10000)
                                          .replace('{淘口令}',command)
                                          .replace('{短连接}',miniUrl)
                                          .replace('{商品文案}',notArr[0].Recommend);
                                          
          
          if(configs.sendImg){
            bot.sendMsg({
              file: request(notArr[0].TgPic),
              filename: notArr[0].TgPic.split('.cn/')[1]
            }, configs.wxContacts.UserName)
            .catch(err => {
              bot.emit('error', err)
            })
          }
          bot.sendMsg(text, configs.wxContacts.UserName).then(res => {
            notArr[0].GoodsType = '成功';
            configs.chosenList = alreadyArr.concat(notArr);
            io.sockets.emit('progressRelease', {
                result: 'success',
                data: {
                  chosenList: configs.chosenList,
                  accomplish: {
                    name: notArr[0].ShowTitle
                  }
                },
                msg: '商品发送成功'
            });
          }).catch(err => {
            notArr[0].GoodsType = '失败';
            configs.chosenList = alreadyArr.concat(notArr);
            io.sockets.emit('progressRelease', {
                result: 'error',
                data: {
                  chosenList: configs.chosenList,
                  accomplish: {
                    name: notArr[0].ShowTitle
                  }
                },
                msg: '商品发送失败'
            });
          })
        }); 
      });
      req.write(querystring.stringify({
        itemid: notArr[0].ItemId,
        pid: configs.mgPid
      }));
      req.end();
      timeing = setTimeout(()=>{
        timerFn();
      },configs.second*1000);
  }
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