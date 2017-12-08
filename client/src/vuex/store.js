import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    searchTerm: ''
  },
  mutations: {
    CHANGE(state, text){
      state.searchTerm = text;
    }
  }
})

export default store;