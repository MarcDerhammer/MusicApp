<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <span v-if="!name">Who are you?</span>
        <span v-if="name">You are: </span>
          <v-flex xs12 sm5 >
          <v-text-field
            v-model= "name"
            @input = "setName(name)" 
            autofocus 
            label="Enter your name" 
            class="input-group--focused" 
            single-line>
          </v-text-field>
          </v-flex>
        <span v-if="name" style="font-weight: light; text-align: center; opacity: .75">Your name will display as <span style="font-weight: bold;">{{name}}</span> when adding songs & chatting</span>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>
<script>
    import store from '../vuex/store'
    export default {
        data () {
          var stored = localStorage.getItem("Name");
          if(stored){
            name = stored;
            store.commit('CHANGEUSER', name);
          }else{
            name = '';
            store.commit('CHANGEUSER', name);
          }
          
          return {
            pingback: '',
            pingtime: 0,
            name: name
          }
        },
        
        methods: {
          ping: function(){
            this.pingtime = new Date().getTime();
            this.$socket.emit('pinger', 'no');
            this.$socket.emit('songProgUpdate', 75);
          },
          setName: function(nam){
            this.name = nam;
            localStorage.setItem("Name", nam);
            store.commit('CHANGEUSER', nam);
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