<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <span v-if="!user.name">Who are you?</span>
        <span v-if="user.name">You are: </span>
          <v-flex xs12 sm5 >
            <!--todo.. fix the first keypress issue thing..-->
          <v-text-field 
            required
            maxlength="15"
            v-model= "user.name"
            @input = "setName()" 
            label="Enter your name" 
            class="input-group--focused" 
            single-line
            autofocus
            >
          </v-text-field>
          </v-flex>
        <span v-if="user.name" style="font-weight: light; text-align: center; opacity: .75">Your name will display as <span style="font-weight: bold;">{{user.name}}</span> when adding songs & chatting</span>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>
<script>
    import store from '../vuex/store'
    export default {
        data () {
          return {
            pingback: '',
            pingtime: 0
          }
        },
        computed: {
          user(){
            return store.state.user;
          }
        },
        
        methods: {
          ping: function(){
            this.pingtime = new Date().getTime();
            this.$socket.emit('pinger', 'no');
            this.$socket.emit('songProgUpdate', 75);
          },
          setName: function(){
            if(this.user.name)
              store.commit('UPDATEUSER', this.user);
          }
        },
        sockets: {
          pingback: function(data){
            this.pingback = data;
            this.pingtime = new Date().getTime() - this.pingtime;
          }
        }
    }
</script>