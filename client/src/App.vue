<template>
  <v-app dark>
    <v-toolbar controls fixed app :clipped-left="clipped">
      <v-spacer></v-spacer>
      <audio @error='audioError' ref="audio" @ended='songEnded' @timeupdate='onTimeUpdateListener' :src="musicSrc" preload="none" type="audio/mpeg"></audio>
      <h2 v-if="e1 !== 'Search'">{{e1}}</h2>
      <!--<v-btn  @click="joinAudio()" v-if="!listening && e1 !== 'Search'" flat color="blue" >
        <span>Join Audio</span>
        <v-icon>volume_up</v-icon>
      </v-btn>-->
      <SearchBar v-if="e1 === 'Search'"></SearchBar>
      <v-spacer></v-spacer>
      
    <!--<v-btn @click="leaveAudio()" v-if="listening" flat color="blue" >
        <span>Leave Audio</span>
        <v-icon>volume_off</v-icon>
      </v-btn>-->
    </v-toolbar>
    <v-content>
      <router-view ref="main" style="margin-bottom: 50px"></router-view>
    </v-content>
    <v-bottom-nav style="overflow: hidden" fixed :value="true" :active.sync="e1" color="blue grey darken-4">
      <v-btn flat color="blue" value="Queue" href="#/">
        <span>Queue</span>
        <v-icon>queue_music</v-icon>
      </v-btn>
      <v-btn flat color="blue" value="Search" href="#/search">
        <span>Search Music</span>
        <v-icon>music_note</v-icon>
      </v-btn>
      <v-btn flat color="blue" value="You" href="#/you">
        <span>You</span>
        <v-icon>person</v-icon>
      </v-btn>
      <v-btn v-if="!listening" @click="joinAudio()" color="blue" value="">
        <v-icon>volume_mute</v-icon>
      </v-btn>
      <v-btn v-if="listening && isMaster" @click="leaveAudio()" color="blue" value="">
        <span>Master</span>
        <v-icon>volume_up</v-icon>
      </v-btn>
      <v-btn v-if="listening && !isMaster" @click="leaveAudio()" color="blue" value="">
        <v-icon>volume_up</v-icon>
      </v-btn>
    </v-bottom-nav>
    <v-snackbar
      :timeout="snackTimeout"
      top
      v-model="snackbar"
    >
      {{ snackText }}
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
    
    
  </v-app>
</template>

<script>
  import SearchBar from './components/SearchBar'
  import store from './vuex/store'
  import axios from 'axios'
  import Vue from 'Vue'
  window.EventBus = new Vue();
  export default {
    data () {
      return {
        clipped: false,
        e1: 'Queue',
        snackTimeout: 2500,
        snackbar: false,
        snackText: '',
        currentTime: null,
        currentTimeStamp: 0,
        lastProg: {},
        isMaster: false
      }
    },
    computed: {
      listening(){
        return store.state.listening;
      },
      volume(){
        return store.state.volume;
      },
      musicSrc(){
        var song = store.state.songQueue[0];
        if(song && song.downloaded){
          return 'https://marcderhammer.com/audio/' + song.storeId + ".mp3";
        }
        if(song && !song.downloaded){
          return 'https://marcderhammer.com/audio/error.mp3';
        }
        return '';
      }
    },
    methods: {
      joinAudio(){
        store.commit('JOINAUDIO', true);
        this.$socket.emit('joinAudio', 'hey');
        this.$refs.audio.play();
        this.syncToMaster();
      },
      leaveAudio(){
        store.commit('LEAVEAUDIO')
        this.$socket.emit('leaveAudio', 'hey');
        this.isMaster = false;
        this.$refs.audio.pause();

      },
      audioError: function(){
        console.log('audio error!!');
      },
      onTimeUpdateListener: function(){
        if(this.$refs && this.$refs.audio){
          var oldTime = this.currentTime;
          this.currentTime = this.$refs.audio.currentTime;
          this.currentTimeStamp = Date.now();
          var report = {
            prog: this.$refs.audio.currentTime
          }
          if(oldTime != null && oldTime != this.currentTime)
            this.$socket.emit('songReport', report);
        }
        
        
      },
      songEnded: function(){
        this.$socket.emit('songEnded');
      },

      setTime: function(time){
        this.$refs.audio.currentTime = time;
      },
      syncToMaster: function(override){
        if(this.listening && this.$socket.id !== this.lastProg.id || override){
          var now = Date.now();
          var diff = this.lastProg.timeReceived - this.currentTimeStamp;
          diff/=1000;
          var currentlyReal = this.currentTime + diff;
          if(Math.abs(currentlyReal - this.lastProg.seconds) > 1){
            var timeShouldBe = this.lastProg.seconds;
            this.setTime(timeShouldBe);
            this.snackText = "Syncing you to master";
            this.snackbar = true;
          }
        }
      }
    },
    watch: {
      listening: function(val){
        if(!val){
          this.$refs.audio.pause();
        }else{
          this.$refs.audio.play();
        }
      },
      volume: function(val){
        val /= 100;
        this.$refs.audio.volume = val;
      },
      isMaster: function(val){
        console.log(val);
        store.commit('MASTER', val);
      }
    },
    components:{
      SearchBar
    },
    sockets: {
      fixedSong: function(data){
        if(this.listening){
          this.$refs.audio.src = 'https://marcderhammer.com/audio/' + data + ".mp3";
          this.$refs.audio.play();
        }
      },
      master: function(data){
        if(data){
          this.snackText = 'You have joined Audio and you are the audio master';
          store.commit('MASTER', true);
          this.snackbar = true;
        }else{
          this.snackText = 'You have joined Audio';
          this.snackbar = true;
        }
      },
      newMaster: function(){
        this.snackText = 'You have been selected as the new Audio master';
        store.commit('MASTER', true);
        this.snackbar = true;
      },
      playNextSong: function(){
        if(this.listening){

          this.$refs.audio.play();
        }
      },
      songProg: function(data){
        if(this.listening){
          if(this.$socket.id === data.id){
            this.isMaster = true;
          }else{
            this.isMaster = false;
          }
          this.lastProg = data;
          this.lastProg.timeReceived = Date.now();
          this.syncToMaster(false);
        }
      },
      songProgChange: function(data){
        console.log(data);
        if(this.listening){
          if(this.$socket.id === data.id){
            this.isMaster = true;
          }else{
            this.isMaster = false;
          }
          this.lastProg = data;
          this.lastProg.timeReceived = Date.now();
          this.syncToMaster(true);
        }
      }
    }
  }

</script>
