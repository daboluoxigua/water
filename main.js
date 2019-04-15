import Vue from 'vue'
import App from './App'

import store from './store'

import QQMapWX from './components/qqmap-wx-jssdk'

Vue.config.productionTip = false

Vue.prototype.$store = store
Vue.prototype.$QQMapWX = QQMapWX

App.mpType = 'app'

const app = new Vue({
    store,
    ...App
})
app.$mount()
