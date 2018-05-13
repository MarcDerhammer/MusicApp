<template>
  <v-container fluid style="padding: 0px">
    <v-layout column align-center>
      <v-flex xs12 style="width: 500px; padding: 15px" v-bind:style="{'height': height, 'overflow-y': 'scroll'}" class="hoverscroll" v-chat-scroll="{always: false}">
        <div  v-for="(chat, index) in chats" v-bind:key="chat.date" v-show="chat.user.id !== -1 || showBot">
          <div style="margin-top: 10px;" v-bind:style="{'text-align': (chat.user.id === user.id ? 'right' : 'left')}">
          <p 
            :title="new Date(chat.date) | moment('MMMM Do, h:mm:ss a')"
            v-bind:style="{'background-color': chat.user.color}" 
            style="padding: 8px; border-radius: 14px; display: inline-block; margin: 0px;">
            {{chat.message}}
          </p>
          </div>
          <div v-if="
              index == chats.length-1 || 
              (index < chats.length-1 && chats[index+1].user.id != chat.user.id) 
              ||
              chats[index+1].date - chat.date > 600000
              "  
              style="opacity: .5; font-size: 10px; padding-top: 4px; padding-bottom: 8px"
              v-bind:style="{'text-align': (chat.user.id === user.id ? 'right' : 'left')}"
              
            >
            {{chat.user.name}} - 
            <span v-if="new Date().getTime() - chat.date > 28800000">{{new Date(chat.date) | moment("MMMM Do, h:mm a")}}</span>
            <span v-if="new Date().getTime() - chat.date < 28800000">{{new Date(chat.date) | moment("h:mm a")}}</span>
          </div>
        </div>
        <!--<v-switch
      :label="(showBot ? `Hide` : `Show`) + ` Server Messages`"
      v-model="showBot"
      @change="setBot()"
    ></v-switch>-->
      </v-flex>
    </v-layout>
<v-layout column align-center>
    <v-bottom-nav  style="overflow: hidden; margin-bottom: 60px; padding: 10px; padding-top: 0px;max-width: 500px" color="gray" fixed :value="true" >
      <v-text-field 
            maxlength="500"
            v-model= "chatMessage"
            label="Click here to chat" 
            class="input-group--focused" 
            single-line
            @keyup.enter.native="addChat(chatMessage)"
            >
          </v-text-field>
    </v-bottom-nav>
</v-layout>

      
  </v-container>
</template>
<script>
  import store from '../vuex/store'
  
  export default {
    data () {
      return {
        chatMessage: '',
        height: '0px',
        windowHeight: 0,
        showBot: JSON.parse(localStorage.getItem('showBot')) || true
      }
    },
    watch: {
    windowHeight(newHeight, oldHeight) {
     
    },
    unreadChats(){
      store.commit('MARKCHATSASREAD', 'YEA');
    }
  },
  mounted() {
    store.commit('MARKCHATSASREAD', 'YEA');
    this.windowHeight = window.innerHeight
    this.height = this.windowHeight - 140 + 'px';
    let that = this;
    this.$nextTick(function() {
      window.addEventListener('resize', function(e) {
        that.windowHeight = window.innerHeight
        that.height = that.windowHeight - 140 + 'px';
        console.log(that.height);
      });
    })
  },
    computed: {
      chats() {
        return store.state.chats
      },
      user(){
        return store.state.user;
      },
      unreadChats(){
        return store.state.unreadChats;
      }
    },
    methods: {
      setBot(){
        localStorage.setItem('showBot', this.showBot);
      },
      addChat(message){
        if(message){
          var payload = {
            user: this.user,
            message: message
          }
          this.$socket.emit('addChat', payload);
          this.chatMessage = '';
        }
      },
      momMill(mill){
        console.log(moment(mill));
      }
    },
    sockets: {
      newChat: function(data){
        this.dialog3 = true;
        this.alertMessage = data;
      }
    }
  }
  
</script>