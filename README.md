# meiguang

> An electron-vue project

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

# 美逛微信机器人

> 定时发送商品
> 自动通过好友申请
> 界面友好
> 支持 MAC 和 Windows 双系统

---

## 功能

### 注册登录
    已有账号的可以直接登录，没有账号的得注册，账号会绑定当前设备，一个设备一个账号
   ![注册登录][1]

### 操作界面
    登录账号后，会提示账号剩余天数
   ![操作界面][2]

### 微信配置
    扫描二维码，登录微信，如果二维码失效，点击 “重新加载二维码” 在进行操作。
    微信登录后，必须填写美逛pid，必须选择发单组，然后点 “确认微信配置” ，“自动同意好友请求” 是可选项，每次操作配置，都必须点确认
   ![微信配置][3]
   ![微信配置][4]

### 文案配置
    在文案配置里可以设置回复模板，互相搭配变量，模板设置里可以选择是否发送图片，不选的话，就只发文字，邀请码使用短连接是可以填写，然后点击确认配置，如果没有操作，可以忽略。
   ![文案配置][5]

### 产品库
    进入产品库时是没有商品的，需要点击搜索，然后选择自己中意的商品，点击“确认商品”。
   ![产品库][6]

### 定时发单
    进入定时发单界面，操作发单间隔时间，点击“开始发单即可”，如果看不到商品，请到产品库点击“确认商品”。
    发单成功后，软件会有提示，如果提前终止任务，再次点击开始时，只会重新发送“等待发送的产品”，其他产品不会发送。
   ![定时发单][7]
   ![定时发单][8]

---
机器人交流群：125100084

[1]: https://github.com/chengle123/meiguang/blob/master/src/1.png
[2]: https://github.com/chengle123/meiguang/blob/master/src/2.png
[3]: https://github.com/chengle123/meiguang/blob/master/src/3.png
[4]: https://github.com/chengle123/meiguang/blob/master/src/4.png
[5]: https://github.com/chengle123/meiguang/blob/master/src/5.png
[6]: https://github.com/chengle123/meiguang/blob/master/src/6.png
[7]: https://github.com/chengle123/meiguang/blob/master/src/7.png
[8]: https://github.com/chengle123/meiguang/blob/master/src/8.png
