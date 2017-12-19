import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    searchTerm: '',
    searchResults: {},
    songQueue: [],
    userName: '',
    listening: false,
    volume: 100
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
    CHANGEUSER(state, name){
      state.userName = name;
    },
    JOINAUDIO(state, val){
      state.listening = true;
    },
    LEAVEAUDIO(state){
      state.listening = false;
    },
    VOLUME(state, val){
      state.volume = val;
    }
  }
})

export default store;