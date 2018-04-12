import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    searchTerm: '',
    searchResults: {},
    songQueue: [],
    user: {},
    listening: false,
    volume: 50,
    master: false
  },
  mutations: {
    CHANGE(state, text){
      state.searchTerm = text;
    },
    RESULTCHANGE(state, songs){
      state.searchResults = songs;
    },
    UPDATESONGQUEUE(state, queue){
      state.songQueue = queue;
    },
    UPDATEUSERINFO(state, userinfo){
      state.songQueue.forEach(function(obj){
        if(obj.user && obj.user.id == userinfo.id){
          obj.user = userinfo;
        }
      });
    },
    UPDATEUSER(state, user){
      localStorage.setItem('user', JSON.stringify(user));
      state.user = user;
      console.log('Updated user to ' + user.name + " : " + user.id);
    },
    /*CHANGEUSER(state, name){
      state.userName = name;
    },*/
    JOINAUDIO(state, val){
      state.listening = true;
    },
    LEAVEAUDIO(state){
      state.listening = false;
      state.master = false;
    },
    VOLUME(state, val){
      state.volume = val;
    },
    MASTER(state, status){
      state.master = status;
    }
  }
})

export default store;