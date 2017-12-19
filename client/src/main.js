// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

import App from './App'
import router from './router'
import store from './vuex/store'
import VueSocketio from 'vue-socket.io'

Vue.use(Vuetify)
Vue.use(VueSocketio, "https://marcderhammer.com:3001");
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  store,
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  sockets: {
    connect: function() {
      console.log('sock connect');
    },
    songQueue: function(val){
      store.commit('UPDATESONGQUEUE', val);
    }
  },
  methods:{
  }
  
})

