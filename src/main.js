import Vue from 'vue'
import App from './App.vue'

import Vuesax from 'vuesax'

import 'vuesax/dist/vuesax.css' //Vuesax styles
import 'material-icons/iconfont/material-icons.css';

import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import 'ag-grid-community/dist/styles/ag-grid.css'

Vue.use(Vuesax)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
