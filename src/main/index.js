import { app, BrowserWindow, dialog, webContents, Menu, ipcMain } from 'electron'
import { ebtMain } from 'electron-baidu-tongji'

const opn = require('opn');
const os=require('os');

const http = require('http');
const https = require('https');
const querystring = require('querystring');
const request = require('request')

const Wechat = require('wechat4u');
const fs = require('fs');
const path = require('path');
const extend = require('node.extend');

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
let appServer = express();
let server = require('http').createServer(appServer);
let io = require('socket.io')(server);

// 注册需要的数据，电脑信息
var type=os.type();
var hostname=os.hostname();
var cpu = os.cpus();
var equipmentId = hostname+'/'+type+'/'+cpu.length+'/'+cpu[0].model+'/'+cpu[0].speed
// console.log(equipmentId)

// 文件地址
let USERDATA_PATH = app.getPath('userData');
// let bot = new Wechat();
let bot;

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}


// mac 快捷键
var template = [{
  label: "Application",
  submenu: [
      { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
  ]}, {
  label: "Edit",
  submenu: [
      { label: "Undo", accelerator: "CommandOrControl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CommandOrControl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CommandOrControl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CommandOrControl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CommandOrControl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CommandOrControl+A", selector: "selectAll:" }
  ]}
];

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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

  mainWindow.webContents.on('new-window', (event,url) => {
    opn(url)
    event.preventDefault()
  });

  mainWindow.on('closed', () => {
    mainWindow = null
  })
};

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


// 百度统计
ebtMain(ipcMain)

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
  // autoUpdater.checkForUpdates()
});


//  服务==========================================
var configs = {
  userAvatar:'',
  mgPid:'mm_116847654_42542764_791720985',
  wxPassFriend:false,
  wxContacts:[],
  chosenList:[],
  second:150,
  invitationCode: 'ZCMVPZR',
  sendImg: false,
  goodsUrl: 'm.11526568cn.cn',
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
let logingType=false;

try {
  configs = extend(configs, JSON.parse(fs.readFileSync(USERDATA_PATH.replace(/\\/g, "/")+'/meiguangConfigs.json', 'utf-8')));
} catch (e){}

io.on('connection', function(socket) {
    io.sockets.emit('configs',configs);
});

function init(){
  bot = '';
  /**
   * 尝试获取本地登录数据，免扫码
   * 这里演示从本地文件中获取数据
   */
  try {
    bot = new Wechat(JSON.parse(fs.readFileSync(USERDATA_PATH.replace(/\\/g, "/")+'/meiguangWXData.json', 'utf-8')));
    console.log('获取已登录数据');
  } catch (e) {
    bot = new Wechat();
    console.log('新建实例')
  }
  /**
   * 启动机器人
   */
  if (bot.PROP.uin) {
    // 存在登录数据时，可以随时调用restart进行重启
    bot.restart();
    console.log('重启实例');
    group();
  } else {
    logingType=false;
    bot.start();
    console.log('启动实例')
  }
}
// console.log(USERDATA_PATH)

// 登录成功事件
function group(){
  var contacts = bot.contacts;
    var contact = [];
    for(var key in contacts){
      if(contacts[key].MemberList.length>0){
        contact.push(contacts[key]);
      }
    }
    logingType=true;
    contact = unique(contact);
    var img;
    var imgData = fs.readFileSync(USERDATA_PATH.replace(/\\/g, "/")+'/meiguangWXImg.txt', 'utf-8');
    if(configs.userAvatar){
      img = configs.userAvatar;
    }else if(imgData){
      img = imgData;
    }else{
      img = ''
    }
    io.emit('userAvatar', {
        result: 'success',
        data: {
          url: img,
          userName: bot.user.NickName,
          contacts: contact
        },
        msg: '登录成功'
    });
}
init();
bot.on('login', () => {
    console.log('登录事件')
    fs.writeFileSync(USERDATA_PATH+'/meiguangWXData.json', JSON.stringify(bot.botData));
    group();
})

// 登录用户头像事件，手机扫描后可以得到登录用户头像的Data URL
bot.on('user-avatar', avatar => {
  configs.userAvatar = avatar;
  fs.writeFileSync(USERDATA_PATH+'/meiguangWXImg.txt', configs.userAvatar);
})

// 心跳间隔
bot.setPollingIntervalGetter(function () {
  return 2 * 60 * 1000;
});

bot.on('error', err => {
  console.log('错误：', err);
  if(err.actual == '1101'){
    fs.unlinkSync(USERDATA_PATH+'/meiguangWXData.json');
    // fs.unlinkSync(USERDATA_PATH+'/meiguangWXImg.txt');
    logingType=false;
    clearTimeout(timeing);
    bot.stop();
    io.emit('logout', {
      result: 'success',
      data: [],
      msg: '登录状态已退出'
    });
    init();
    var stateTime = setInterval(()=>{
      if(bot.state === 'login'){
        fs.writeFileSync(USERDATA_PATH+'/meiguangWXData.json', JSON.stringify(bot.botData));
        group();
        clearInterval(stateTime);
      };
    },10000);
  }
})


// 其他操作======================
// 获取商品列表
function getGoodsList(resJson){
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
                item.AfterDiscount = (item.ShowPrice - item.QuanAmount) * 100 / 10000;
                item.Income = (item.AfterDiscount * (item.Rate * 0.45 / 10000)).toFixed(2);
                item.discountsRatio = (100-(item.AfterDiscount / (item.ShowPrice * 100 / 10000)*100)).toFixed(2);
                arr.push(item);
              });
            }
          }
          resJson.json({
              result: 'success',
              data: arr,
              msg: '商品列表获取成功'
          })
        }); 
    });
    req.on('error', function (e) {
      resJson.json({
          result: 'error',
          data: [],
          msg: '商品列表获取失败,E001'
      })
    }); 
    req.end();
  }catch(e){
    resJson.json({
        result: 'error',
        data: [],
        msg: '商品列表获取失败,E002'
    })
  }
}

//  发送文本
function sendText(notArr,alreadyArr,text,wxContacts){
  bot.sendMsg(text, wxContacts.UserName).then(res => {
    notArr[0].GoodsType = '成功';
    configs.chosenList = alreadyArr.concat(notArr);
    io.emit('progressRelease', {
        result: 'success',
        data: {
          chosenList: configs.chosenList,
          accomplish: {
            name: notArr[0].ShowTitle
          }
        },
        msg: wxContacts.NickName + ' 商品发送成功'
    });
    if(notArr.length == 1){
      clearTimeout(timeing);
      io.emit('clearTimeout', {
          result: 'success',
          data: {},
          msg: '所有产品发送完毕，停止定时'
      });
      return;
    }
  }).catch(err => {
    notArr[0].GoodsType = '失败';
    configs.chosenList = alreadyArr.concat(notArr);
    io.emit('progressRelease', {
        result: 'error',
        data: {
          chosenList: configs.chosenList,
          accomplish: {
            name: notArr[0].ShowTitle
          }
        },
        msg: wxContacts.NickName + ' 商品发送失败'
    });
    // if(err.actual == 1101){
    //   clearTimeout(timeing);
    //   io.emit('logout', {
    //     result: 'success',
    //     data: [],
    //     msg: '登录状态已退出'
    //   });
    //   bot.contacts={};
    // }
    // init();
  })
}

// 定时器(ps循环发送)
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
    io.emit('clearTimeout', {
        result: 'success',
        data: {},
        msg: '所有产品发送完毕，停止定时'
    });
    return;
  }
  var url = 'http://'+configs.goodsUrl+'/AppCms/index.html?ui=http://cdn.temzt.cn/AppCms/UI/sharedetail.html&pid='+configs.mgPid+'&itemid='+notArr[0].ItemId+'&invitecode='+configs.invitationCode;
  var reqUrl = https.request({
      hostname: 'www.ft12.com',
      method: 'POST',
      path: '/do.php?m=index&a=urlCreate',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'    
      }
    }, function (res) {
        var urlText = '';
        res.setEncoding('utf8'); 
        res.on('data', function (chunk) {
            urlText += chunk;
        }); 
        res.on('end', function (data) {
          miniUrl = JSON.parse(urlText).list;
          console.log(miniUrl,1)
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
                                              .replace('{券后价格}',notArr[0].AfterDiscount)
                                              .replace('{淘口令}',command)
                                              .replace('{短连接}',miniUrl)
                                              .replace('{商品文案}',notArr[0].Recommend);

              console.log(miniUrl,2)
              if(configs.sendImg){
                var qrImg = http.request({
                      hostname: 'meiguang.emym.top',
                      method: 'POST',
                      path: '/getQrCodeImg',
                      headers: {
                          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'    
                      }
                    }, function (res) {
                        var qrData = '';
                        res.setEncoding('utf8'); 
                        res.on('data', function (chunk) {
                            qrData += chunk;
                        }); 
                        res.on('end', function () {
                          var imgData = JSON.parse(qrData);
                          if(imgData.result == 'success'){
                            console.log(imgData.data.imgUrl)
                            console.log(imgData.data.imgName)
                            configs.wxContacts.map(item => {
                              bot.sendMsg({
                                file: request(imgData.data.imgUrl),
                                filename: imgData.data.imgName
                              }, item.UserName)
                              .then(res =>{
                                sendText(notArr, alreadyArr, text, item);
                              })
                              .catch(err => {
                                // bot.emit('error', err)
                                notArr[0].GoodsType = '失败';
                                configs.chosenList = alreadyArr.concat(notArr);
                                io.emit('progressRelease', {
                                    result: 'error',
                                    data: {
                                      chosenList: configs.chosenList,
                                      accomplish: {
                                        name: notArr[0].ShowTitle
                                      }
                                    },
                                    msg: item.NickName + ' 商品发送失败'
                                });
                                // if(!err.actual){
                                //   clearTimeout(timeing);
                                //   io.emit('logout', {
                                //     result: 'success',
                                //     data: [],
                                //     msg: '登录状态已退出'
                                //   });
                                //   bot.contacts={};
                                // }
                                // init();
                              })
                            });
                          }else{
                            notArr[0].GoodsType = '失败';
                            configs.chosenList = alreadyArr.concat(notArr);
                            io.emit('progressRelease', {
                                result: 'error',
                                data: {
                                  chosenList: configs.chosenList,
                                  accomplish: {
                                    name: notArr[0].ShowTitle
                                  }
                                },
                                msg: '商品发送失败，图片异常'
                            });
                          }
                        }); 
                    });
                    qrImg.write(querystring.stringify({
                      data: JSON.stringify(notArr[0]),
                      url: url
                    }));
                    qrImg.end();
              }else{
                configs.wxContacts.map(item => {
                  sendText(notArr, alreadyArr, text, item);
                })
              }
            }); 
          });
          req.write(querystring.stringify({
            itemid: notArr[0].ItemId,
            pid: configs.mgPid
          }));
          req.end();
        }); 
    });
    reqUrl.write(querystring.stringify({
      url: url,
      type: 'u6'
    }));
    reqUrl.end();
    timeing = setTimeout(()=>{
      timerFn();
    }, configs.second*1000);
}

// 去重
function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}


appServer.use(bodyParser.urlencoded({ limit:'50mb', extended: false }));
appServer.use(bodyParser.json({limit:'50mb'}));
// appServer.use(express.static(path.join(__dirname, '../renderer/app')));
server.listen(8990, function() {
	console.log('Ready');
});

// 接口开始===================

// 获取微信二维码
router.post('/wxLogin', function(req, res) {
  try{
    if(bot.PROP.uuid && !logingType){
        res.json({
            result: 'success',
            data: {url:'https://login.weixin.qq.com/qrcode/' + bot.PROP.uuid},
            msg: '二维码获取成功'
        })
    }else{
        init();
        res.json({
            result: 'success',
            data: [],
            msg: '已登录'
        })
    }
  }catch(e){
      res.json({
          result: 'error',
          data: '',
          msg: '二维码获取失败'
      })
  }
})

// 重新获取微信二维码
router.post('/anewGetWxLogin', function(req, res) {
  try{
    bot.stop();
    logingType = false;
    init();
    setTimeout(()=>{
        if(bot.PROP.uuid && !logingType){
          res.json({
              result: 'success',
              data: {url:'https://login.weixin.qq.com/qrcode/' + bot.PROP.uuid},
              msg: '二维码获取成功'
          })
      }else{
          res.json({
              result: 'success',
              data: [],
              msg: '已登录'
          })
      }
    },1000)
  }catch(e){
      res.json({
          result: 'error',
          data: '',
          msg: '二维码获取失败'
      })
  }
})

// 获取设备码
router.post('/equipmentId', function(req, res) {
  try{
      res.json({
          result: 'success',
          data: {equipmentId:equipmentId},
          msg: '设备标识码'
      })
  }catch(e){
      res.json({
          result: 'error',
          data: '',
          msg: '设备标识码获取失败'
      })
  }
})

// 确认微信配置
router.post('/queryWX', function(req, res) {
  try{
      configs = extend(configs, req.body);
      fs.writeFileSync(USERDATA_PATH+'/meiguangConfigs.json', JSON.stringify(configs));
      if(configs.wxPassFriend){
        bot.on('message', msg => {
          if (msg.MsgType == bot.CONF.MSGTYPE_VERIFYMSG) {
            bot.verifyUser(msg.RecommendInfo.UserName, msg.RecommendInfo.Ticket)
            .then(res => {
                io.emit('wxPassFriend', {
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
      io.emit('queryWX', {
          result: 'success',
          data: [],
          msg: '微信配置成功'
      });
      res.json({
          result: 'success',
          data: [],
          msg: '微信配置成功'
      })
  }catch(e){
      res.json({
          result: 'error',
          data: '',
          msg: '微信配置失败'
      })
  }
})

// 确认文案配置
router.post('/queryText', function(req, res) {
  try{
      configs = extend(configs, req.body);
      fs.writeFileSync(USERDATA_PATH+'/meiguangConfigs.json', JSON.stringify(configs));
      res.json({
          result: 'success',
          data: [],
          msg: '文案配置成功'
      })
  }catch(e){
      res.json({
          result: 'error',
          data: [],
          msg: '文案配置失败'
      })
  }
})

// 获取商品
router.post('/getGoodsList', function(req, res) {
  try{
      getGoodsList(res);
  }catch(e){
      res.json({
          result: 'error',
          data: [],
          msg: '商品列表获取失败,E003'
      })
  }
})

// 已选中商品
router.post('/setChosenList', function(req, res) {
  try{
    configs = extend(configs, req.body);
    io.emit('setChosenList', {
        result: 'success',
        data: configs.chosenList,
        msg: '选中商品列表获取成功'
    });
    res.json({
        result: 'success',
        data: configs.chosenList,
        msg: '选中商品列表获取成功'
    })
  }catch(e){
      res.json({
          result: 'error',
          data: [],
          msg: '选中商品列表获取失败'
      })
  }
})

// 刷新群列表
router.post('/refreshFlock', function(req, res) {
  try{
    var contacts = bot.contacts;
    var contact = [];
    for(var key in contacts){
      if(contacts[key].MemberList.length>0){
        contact.push(contacts[key]);
      }
    }
    res.json({
        result: 'success',
        data: contact,
        msg: '刷新成功'
    })
  }catch(e){
      res.json({
          result: 'error',
          data: [],
          msg: '刷新失败'
      })
  }
})

// 开始发单
router.post('/startRelease', function(req, res) {
  try{
    configs = extend(configs, req.body);
    timerFn();
    res.json({
        result: 'success',
        data: [],
        msg: '定时发单启动成功'
    })
  }catch(e){
      res.json({
          result: 'error',
          data: [],
          msg: '定时发单启动失败'
      })
  }
})

// 停止发单
router.post('/endRelease', function(req, res) {
  try{
    clearTimeout(timeing);
    res.json({
        result: 'success',
        data: [],
        msg: '已经停止发单'
    })
  }catch(e){
      res.json({
          result: 'error',
          data: [],
          msg: '停止发单失败'
      })
  }
})

appServer.use('/', router);

