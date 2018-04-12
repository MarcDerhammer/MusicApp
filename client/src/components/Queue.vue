<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <v-flex style="width: 500px" v-if="nowPlaying" xs12>
          <v-card class="white--text">
            <v-container style="padding-bottom: 6px; padding-top: 6px">
              <v-layout style="margin-bottom: 8px;" row>
                <v-flex flex align-center style="text-align:center">
                  <span v-if="!listening" style="font-weight: lighter; font-size: 10px;">Press the play button to join audio stream</span>
                  <span v-if="!master && listening" style="font-weight: lighter; font-size: 10px;">Listening is synced with another source</span>
                  <span v-if="master" style="font-weight: lighter; font-size: 10px;">You are the audio master and have full control</span>
                  <span v-if="listening && listeners == 2" style="font-weight: lighter; font-size: 10px; display:block">There is {{listeners-1}} other device listening to the stream</span>
                  <span v-if="listening && listeners > 2" style="font-weight: lighter; font-size: 10px; display:block">There are {{listeners-1}} other devices listening to the stream</span>
                </v-flex>
              </v-layout>
                <v-layout row>
                <v-flex xs12 align-center style="text-align:center">
                  <img flex style="max-width: 300px;" :src="nowPlaying.albumArtRef[0].url" width="100%"/>
                </v-flex>
                </v-layout>
                <v-layout flex row>
                  <v-flex flex align-center style="max-height: 175px; overflow: hidden; text-overflow: ellipsis; text-align: center">
                    <h3>{{nowPlaying.title}}</h3>
                    <h4 style="font-weight: lighter">{{nowPlaying.artist}}</h4>
                    <h4 style="font-weight: lighter; opacity: .8">{{nowPlaying.album}} ({{nowPlaying.year}})<v-icon v-if="nowPlaying.contentType==='1'">explicit</v-icon></h4>
                    <h6 v-if="nowPlaying.user && nowPlaying.user.name" style="opacity: .5; font-weight: lighter">Queued by {{nowPlaying.user.name}}</h6>
                    <h6 v-if="nowPlaying.botAdd" style="opacity: .5; font-weight: lighter">Auto-added by the server</h6>
                  </v-flex>
                </v-layout>
                <v-layout row>
                <!--  <v-icon style="font-size: 12px" @click="downvote(nowPlaying)" class="vote">thumb_down</v-icon>-->
                  <v-flex flex="100" align-center style="text-align: center; display: inline block;">
                        <v-icon @click="previous()" class="vote controls">skip_previous</v-icon>
                        <v-icon v-if="!listening" @click="joinAudio()" class="vote controls">play_arrow</v-icon>
                        <v-icon v-if="listening" @click="leaveAudio()" class="vote controls">pause</v-icon>
                        <v-icon @click="remove(nowPlaying)" class="vote controls">skip_next</v-icon>
                  </v-flex>
                  <!--<v-icon style="font-size: 12px" @click="downvote(nowPlaying)" class="vote">thumb_up</v-icon>-->
                </v-layout>
                <v-layout style="opacity: .5" row fill-height>
                      <span style="margin-top: auto">{{timeIn}}</span>
                      <v-spacer flex v-if="!listening"></v-spacer>
                      <v-layout v-if="listening">
                        <v-icon @click='unmute()' v-if="listening && volume == 0" style="margin-right: 25px; cursor:pointer; margin-left: 30px">volume_mute</v-icon>
                        <v-icon @click='mute()' v-if="listening && volume !== 0" style="margin-right: 25px;cursor:pointer; margin-left: 30px">volume_up</v-icon>
                        <v-slider v-if="listening" @input='updateVolume()' v-model="volume" step="0" style="cursor:pointer; padding-top: 0px; margin-right: 30px; height: 14px"></v-slider>
                      </v-layout>
                      <span style="margin-top: auto" >-{{timeRemaining}}</span>
                </v-layout>
            </v-container>
            <v-progress-linear id="progBar" style="cursor:pointer; margin-top:0px" @click="clickProg($event)" v-model="songProg"></v-progress-linear>
          </v-card>
        </v-flex>
        <v-flex style="width: 500px" xs12 >
          <v-list two-line style="max-width: 500px; ">
            <template v-if="index !== 0" style="max-width: 500px" v-for="(i, index) in queue">
              <v-list-tile v-bind:style="{'background-color': (i.user ? i.user.color : '')}" avatar v-bind:key="i.nid" >
                <v-list-tile-avatar>
                  <img v-bind:src="i.albumArtRef[0].url">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title style="overflow:hidden; text-overflow: ellipsis" v-html="i.title"></v-list-tile-title>
                  <v-list-tile-sub-title style="overflow:hidden; text-overflow: ellipsis" v-html="i.artist"></v-list-tile-sub-title>
                </v-list-tile-content>

                <v-progress-circular indeterminate color="primary" v-if="!i.downloaded"></v-progress-circular>
                <span v-if="i.score > 0" style="color:green; opacity: .75">&nbsp;+{{i.score}}&nbsp;</span>
                <span v-if="i.score < 0" style="color:red; opacity: .75">&nbsp;{{i.score}}&nbsp;</span>
                <v-tooltip top v-if="i.contentType==='1'"> 
                  <span>Explicit</span>
                  <v-btn disabled slot="activator" flat icon>
                    <v-icon >explicit</v-icon>
                  </v-btn>
                </v-tooltip>
                <v-tooltip top  v-if="master"> 
                  <span>Remove from Queue</span>
                  <v-btn slot="activator" flat icon>
                    <v-icon @click="remove(i)" class="vote">delete</v-icon>
                  </v-btn>
                </v-tooltip>
                <v-tooltip top  v-if="i.botAdd"> 
                  <span>Added by bot</span>
                  <v-btn disabled slot="activator" flat icon>
                  <v-icon >storage</v-icon>
                  </v-btn>
                </v-tooltip>
                <v-tooltip top  v-if="!i.botAdd"> 
                  <span>Added by {{i.user.name}}</span>
                  <v-btn disabled slot="activator" flat icon>
                  <v-icon>person </v-icon>
                  </v-btn>
                  </v-tooltip>
              </v-list-tile>
            </template>
          </v-list>
        <span v-if="aa" style="font-weight: lighter; font-size: 16px; display:block; text-align:center; margin-top: 35px">Auto-adding from {{aa}}.  Search for a new artist or radio station to change!</span>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
    <v-snackbar
      :timeout="snackTimeout"
      top
      v-model="snackbar"
    >
      {{ snackText }}
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-container>
  
</template>

<style>
  .vote{
    opacity: .15;
  }
  .vote:hover{
    opacity: .4;
    cursor: pointer;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .controls{
    padding: 8px;
  }
</style>
<script>
  import store from '../vuex/store'
  
  export default {
    data () {
      return {
        songProg: 0,
        aa: '',
        snackTimeout: 2500,
        snackbar: false,
        snackText: '',
        volume: store.state.volume,
        listeners: 0,
        lastVol: 100,
        timeRemaining: '',
        timeIn: '',
        noSleep: {}
      }
    },
    computed: {
      queue() {
        return store.state.songQueue
      },
      nowPlaying(){
        return store.state.songQueue[0]
      },
      listening(){
        return store.state.listening;
      },
      master(){
        return store.state.master;
      }
    },
    mounted(){
      //ugly hack because the stupid slider adds some bullshit... can probably fix with style but whatever
        if(document.getElementsByClassName("input-group__details") && document.getElementsByClassName("input-group__details")[0]){
          document.getElementsByClassName("input-group__details")[0].outerHTML = ''
        }
        this.noSleep = new NoSleep();
    },
    methods: {
      onlyMasterCan(rest){
        this.snackText = "Only the Master audio controller can " + rest;
        this.snackbar = true;
      },
      remove(song){
        if(!this.master){
          this.onlyMasterCan("skip songs");
          this.$socket.emit('removeFromQueue', song.storeId);
        }else{
          this.$socket.emit('removeFromQueue', song.storeId);
        }
      },
      previous(){
        if(this.master){
          this.$socket.emit('masterSetProg', 0);
        }else{
          this.onlyMasterCan("change song progress");
        }
      },
      millisToNorm: function(dur){
        var d = new Date(1000*Math.round(dur/1000));
        var mins = d.getUTCMinutes();
        var secs = d.getUTCSeconds();
        return mins + ":" + (secs < 10 ? "0" : "") + secs;
      },
      upvote(song){
        song.score++;
        this.$socket.emit('upvote', song)
      },
      downvote(song){
        song.score--;
        this.$socket.emit('downvote', song);
      },
      setVolume(val){
        this.volume = val;
        store.commit('VOLUME', val);
      },
      mute(){
        this.lastVol = this.volume;
        this.setVolume(0)
      },
      unmute(){
        this.setVolume(this.lastVol)
      },
      updateVolume(){
        store.commit('VOLUME', this.volume);
      },
      joinAudio(){
        store.commit('JOINAUDIO', true);
        document.getElementById('audioId').play();
        this.$socket.emit('joinAudio', 'hey');
        //ugly hack because the stupid slider adds some bullshit... can probably fix with style but whatever
        if(document.getElementsByClassName("input-group__details") && document.getElementsByClassName("input-group__details")[0]){
          document.getElementsByClassName("input-group__details")[0].outerHTML = ''
        }
        this.noSleep.enable();
      },
      leaveAudio(){
        store.commit('LEAVEAUDIO')
        this.$socket.emit('leaveAudio', 'hey');
        document.getElementById('audioId').pause();
        this.noSleep.disable();
      },
      clickProg(event){
        //EventBus.$emit('setProgress', event.offsetX/document.getElementById("progBar").offsetWidth);
        var prog = event.offsetX/document.getElementById("progBar").offsetWidth;
        if(this.master){
          this.$socket.emit('masterSetProg', prog);
        }else{
          this.onlyMasterCan("change song progress");
        }
      }
    },
    sockets: {
      songProg: function(data){
        console.log()
        this.timeRemaining = this.millisToNorm(this.nowPlaying.durationMillis - data.seconds *1000);
        this.timeIn = this.millisToNorm(data.seconds *1000);
        this.songProg = data.percentage;
        this.listeners = data.count;
        this.aa = data.aa;
      },
      userOnly: function(data){
        console.log('ok');
        this.queue.forEach(function(element){
          if(element.user && element.user.id == data.id){
            element.user = data;
          }
        });
      }
    },
    watch: {
      listening: function(val){
        if(!val){
          this.listeners--;
        }
      }
    }
  }
  
</script>