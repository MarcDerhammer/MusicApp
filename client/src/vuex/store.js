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
    master: false,
    chats: []
  },
  mutations: {
    CHANGE(state, text){
      state.searchTerm = text;
    },
    RESULTCHANGE(state, songs){
      state.searchResults = songs;
    },
    UPDATESONGQUEUE(state, queue){
      var wasExpanded = [];
      state.songQueue.forEach(function(obj){
        if(obj.expanded){
          wasExpanded.push(obj.storeId);
        }
      });
      wasExpanded.forEach(function(obj){
        queue.forEach(function(obj2){
          if(obj2.storeId == obj){
            obj2.expanded = true;
          }
        })
      });
      state.songQueue = queue;
    },
    UPDATEUSERINFO(state, userinfo){
      state.songQueue.forEach(function(obj){
        if(obj.user && obj.user.id == userinfo.id){
          obj.user = userinfo;
        }
        if(obj.likes){
          obj.likes.forEach(function(obj2){
            if(obj2.id == userinfo.id){
              obj2.name = userinfo.name;
            }
          });
        }
      });
      state.chats.forEach(function(obj){
        if(obj.user && obj.user.id == userinfo.id){
          obj.user = userinfo;
        }
      });
    },
    UPDATECURRENTUSER(state, user){
      localStorage.setItem('user', JSON.stringify(user));
      state.user = user;
    },
    UPDATECHATS(state, chats){
      state.chats = chats;
    },
    ADDCHAT(state, chat){
      state.chats.push(chat);
    },
    UPDATELIKES(state, data){
      state.songQueue.forEach(function(element){
        if(element.storeId == data.storeId){
          element.likes = data.likes;
        }
      });
    },
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