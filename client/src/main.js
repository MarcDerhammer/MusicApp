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
Vue.use(require('vue-moment'));
Vue.config.productionTip = false

if(!!window.navigator.userAgent.match(/MSIE|Trident/)){
  alert('Stop using Internet Explorer.. site won\'t work... \nuse Chrome or Safari or Firefox.. c\'mon it\'s ' + new Date().getFullYear());
  window.location.href="https://www.google.com/chrome/";
}

/* eslint-disable no-new */
var vm = new Vue({
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
    },
    newChat: function(val){
      store.commit('ADDCHAT', val)
    },
    allChats: function(val){
      store.commit('UPDATECHATS', val);
    },
    userOnly: function(data){
      store.commit('UPDATEUSERINFO', data);
    },
    likes: function(data){
      store.commit('UPDATELIKES', data);
    }


  },
  methods:{
  }
  
})

