import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    searchTerm: '',
    searchResults: {},
    songQueue: [],
    userName: ''
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
    }
  }
})

export default store;