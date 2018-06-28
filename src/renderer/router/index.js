import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/app/style.css'

Vue.use(Router)
Vue.use(ElementUI)

export default new Router({
  routes: [
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/',
      name: 'login',
      component: require('@/app/login/login.vue').default
    },
    {
      path: '/index',
      name: 'index',
      component: require('@/app/index.vue').default
    },

  ]
})
