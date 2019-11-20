import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import { ipcRenderer } from 'electron'
import { ebtRenderer } from 'electron-baidu-tongji'

const BAIDU_SITE_ID = '8f85ce91f3d15ed2b16df012bb3734b6'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// 百度统计
ebtRenderer(ipcRenderer, BAIDU_SITE_ID, router)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
