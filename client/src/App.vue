<template>
  <v-app dark>
    <v-toolbar controls fixed app :clipped-left="clipped">
      <v-spacer></v-spacer>
      <audio ref="audio" @ended='songEnded' @timeupdate='onTimeUpdateListener' :src="musicSrc" preload="none" type="audio/mpeg"></audio>
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
      <router-view style="margin-bottom: 50px"></router-view>
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
  export default {
    data () {
      return {
        clipped: false,
        e1: 'Queue',
        snackTimeout: 2500,
        snackbar: false,
        snackText: '',
        currentTime: '00:00',
        currentTimeStamp: 0,
        lastProg: {},
        isMaster: false
      }
    },
    computed: {
      listening(){
        return store.state.listening;
      },
      musicSrc(){
        var song = store.state.songQueue[0];
        if(song){
          console.log('song is' + song.storeId)
          return 'https://marcderhammer.com/audio/' + song.storeId + ".mp3";
        }
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
        this.$refs.audio.pause();

      },
      onTimeUpdateListener: function(){
        if(this.$refs && this.$refs.audio){
          this.currentTime = this.$refs.audio.currentTime;
          this.currentTimeStamp = new Date().getMilliseconds();
          var report = {
            prog: this.$refs.audio.currentTime
          }
          this.$socket.emit('songReport', report);
        }
      },
      songEnded: function(){
        this.$socket.emit('songEnded');
      },

      setTime: function(time){
        this.$refs.audio.currentTime = time;
      },
      syncToMaster: function(){
        if(this.listening && this.$socket.id !== this.lastProg.id){
          var now = new Date().getMilliseconds();
          var diff = now - this.lastProg.timeReceived;
          diff/=1000;
          if(diff + Math.abs(this.lastProg.seconds - this.currentTime) > 1){
            var timeShouldBe = this.lastProg.seconds + diff;
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
      }
    },
    components:{
      SearchBar
    },
    sockets: {
      master: function(data){
        if(data){
          this.snackText = 'You have joined Audio and you are the audio master';
          this.snackbar = true;
        }else{
          this.snackText = 'You have joined Audio';
          this.snackbar = true;
        }
      },
      newMaster: function(){
        this.snackText = 'You have been selected as the new Audio master';
        this.snackbar = true;
      },
      songReadyToPlay: function(data){
        if(this.listening && data === store.state.songQueue[0].storeId){
          this.$refs.audio.src = 'https://marcderhammer.com/audio/' + data + ".mp3";
          this.$refs.audio.play();
        }
      },
      playNextSong: function(){
        this.$refs.audio.play();
      },
      songProg: function(data){
        if(this.$socket.id === data.id){
          this.isMaster = true;
        }else{
          this.isMaster = false;
        }
        this.lastProg = data;
        this.lastProg.timeReceived = new Date().getMilliseconds();
        this.syncToMaster();
      }
    }
  }

</script>
