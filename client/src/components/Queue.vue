<template>
  <v-container fluid style="padding: 0px">
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <v-flex style="width: 500px" v-if="nowPlaying" xs12>
          <v-card   class="white--text">
            <v-container style="padding-bottom: 6px; padding-top: 6px">
              <v-layout style="margin-bottom: 8px;" row>
                <v-flex flex align-center style="text-align:center">
                  <span v-if="!master && listening" style="font-weight: lighter; font-size: 10px;">Listening is synced with another source</span>
                  <span v-if="master" style="font-weight: lighter; font-size: 10px;">You are the audio master and have full control</span>
                </v-flex>
              </v-layout>
                <v-layout row>
                <v-flex v-show="!showLyric" xs12 align-center style="text-align:center" @click="showLyrics()">
                  <img flex style="max-width: 300px;" :src="nowPlaying.albumArtRef[0].url" width="100%"/>
                </v-flex>
                <v-flex v-show="showLyric" xs12 align-center style="text-align:center; height: 300px; overflow-y: scroll; width:100%">
                  <v-btn v-if="!loadingLyrics" color="primary" @click="showLyrics()" flat style="text-align: center">Hide</v-btn>
                  <pre style="white-space: pre-wrap; overflow: y: scroll; text-align: left; width:100%" v-html="lyrics"></pre>
                  <v-progress-circular style="text-align:center; width 100%; height: 100%; margin-auto;" indeterminate color="primary" v-if="loadingLyrics"></v-progress-circular>
                  <v-btn v-if="!loadingLyrics" color="primary" @click="showLyrics()" flat style="text-align: center">Hide</v-btn>
                </v-flex>
                </v-layout>
                <v-layout flex row>
                  <v-flex flex align-center style="max-height: 175px; overflow: hidden; text-overflow: ellipsis; text-align: center">
                    <h3>{{nowPlaying.title}}</h3>
                    <h4 style="font-weight: lighter">{{nowPlaying.artist}}</h4>
                    <!--<h4 style="font-weight: lighter; opacity: .8">{{nowPlaying.album}} ({{nowPlaying.year}})<v-icon v-if="nowPlaying.contentType==='1'">explicit</v-icon></h4>-->
                  </v-flex>
                </v-layout>
                <v-layout row >
                  <v-flex flex="100" align-center style="text-align: center; display: inline block;" >

                  <v-tooltip top v-if="listening && master"> 
                    <span>Skip</span>
                    <v-btn @click="previous()" slot="activator" flat icon style="margin:0px">
                    <v-icon style="opacity: .3;" >skip_previous</v-icon>
                    </v-btn>
                  </v-tooltip>
                  <span v-if="listening && master">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

                  <v-tooltip top v-if="!listening"> 
                  <span>Listen</span>
                  <v-btn @click="joinAudio()" slot="activator" flat icon style="margin:0px">
                  <v-icon style="opacity: .3" >speaker</v-icon><span v-if="listeners > 0">{{listeners}}</span>
                  </v-btn>
                  </v-tooltip>
                  <v-tooltip top v-if="listening"> 
                  <span>Stop Listening</span>
                  <v-btn @click="leaveAudio()" slot="activator" flat icon style="margin:0px">
                  <v-icon class="dance" style="opacity: .8">speaker</v-icon><span v-if="listeners > 0">{{listeners}}</span>
                  </v-btn>
                  </v-tooltip>
                  <span>&nbsp;&nbsp;&nbsp;</span>
                  
                <v-tooltip top v-if="!nowPlaying.likes || !nowPlaying.likes.find(x=>x.id== user.id)"> 
                  <span>Like</span>
                  <v-btn @click="addLike(nowPlaying)" slot="activator" flat icon style="margin:0px">
                  <v-icon style="opacity: .3" >favorite_outline</v-icon><span v-if="nowPlaying.likes && nowPlaying.likes.length > 0">{{nowPlaying.likes.length}}</span>
                  </v-btn>
                </v-tooltip>
                <v-tooltip top v-if="nowPlaying.likes && nowPlaying.likes.find(x=>x.id== user.id)"> 
                  <span>Un-Like</span>
                  <v-btn @click="addLike(nowPlaying)" slot="activator" flat icon style="margin:0px">
                  <v-icon style="opacity: .8; color:red" >favorite</v-icon><span v-if="nowPlaying.likes && nowPlaying.likes.length > 0">{{nowPlaying.likes.length}}</span>
                  </v-btn>
                </v-tooltip>

                <span v-if="listening && master || (nowPlaying.user && nowPlaying.user.id === user.id)">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <v-tooltip top v-if="listening && master || (nowPlaying.user && nowPlaying.user.id === user.id)"> 
                  <span>Skip</span>
                  <v-btn @click="remove(nowPlaying)" slot="activator" flat icon style="margin:0px">
                  <v-icon style="opacity: .3;" >skip_next</v-icon>
                  </v-btn>
                </v-tooltip>
                </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex flex="100" align-center style="text-align: center; display: inline block;">
                <div style="text-align: center" v-if="nowPlaying.likes && nowPlaying.likes.length > 0"><v-icon @click="addLike(nowPlaying)" v-bind:class="{'heart': nowPlaying.likes && nowPlaying.likes.length == 0,'heart1': nowPlaying.likes && nowPlaying.likes.length == 1,'heart2': nowPlaying.likes && nowPlaying.likes.length == 2,'heart3': nowPlaying.likes && nowPlaying.likes.length == 3,'heart4': nowPlaying.likes && nowPlaying.likes.length == 4,'heart5': nowPlaying.likes && nowPlaying.likes.length > 4}" color="red">favorite </v-icon><span> by </span><span  v-for="(l, index2) in nowPlaying.likes" v-bind:key=(index2)>{{l.name}}{{index2 == nowPlaying.likes.length-1 ? '' : ', '}}</span></div>
                  </v-flex>
                </v-layout>

                <v-layout row>
                  <v-flex flex="100" align-center style="text-align: center;">
                    <h3 v-if="nowPlaying.user && nowPlaying.user.name" style="opacity: .8; font-weight: lighter">Added by <b style="font-weight: bold">{{nowPlaying.user.name}}</b></h3>
                    <h6 v-if="nowPlaying.botAdd" style="opacity: .5; font-weight: lighter">Auto-added by the server</h6>
                  </v-flex>
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
            <v-progress-linear id="progBar"  style="cursor:pointer; margin-top:0px" @click="clickProg($event)" v-model="songProg"></v-progress-linear>
          </v-card>
        </v-flex>
        <v-flex style="width: 500px" xs12 >
          <v-list two-line style="max-width: 500px; ">
            <template  v-if="index !== 0" style="max-width: 500px;" v-for="(i, index) in queue">
              <v-list-tile @click="expand(i)" v-bind:style="{'background-color': (i.user ? i.user.color : ''),'border-bottom': (i.expanded ? '': '2px solid rgba(0,0,0,.1)')}" avatar v-bind:key="i.nid" >
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
                
                <v-tooltip top  v-if="i.downloaded && master || (i.user && i.user.id === user.id)"> 
                  <span>Remove from Queue</span>
                  <v-btn slot="activator" flat icon style="margin:0px">
                    <v-icon @click="remove(i)" class="vote">delete</v-icon>
                  </v-btn>
                </v-tooltip>
                <v-tooltip top  v-if="i.botAdd"> 
                  <span>Added by bot</span>
                  <v-btn disabled slot="activator" flat icon style="margin:0px">
                  <v-icon >radio</v-icon>
                  </v-btn>
                </v-tooltip>
                <v-tooltip top  v-if="!i.botAdd && i.user && i.user.name"> 
                  <span>Added by {{i.user.name}}</span>
                  <v-btn disabled slot="activator" flat icon style="margin:0px">
                  <v-icon>person</v-icon>
                  </v-btn>
                  </v-tooltip>
                <v-tooltip top v-if="i.downloaded && (!i.likes || !i.likes.find(x=>x.id== user.id))"> 
                  <span>Like</span>
                  <v-btn @click="addLike(i)" slot="activator" flat icon style="margin:0px">
                  <v-icon style="opacity: .3" >favorite_outline</v-icon><span v-if="i.likes && i.likes.length > 0">{{i.likes.length}}</span>
                  </v-btn>
                </v-tooltip>
                <v-tooltip top v-if="i.downloaded && (i.likes && i.likes.find(x=>x.id== user.id))"> 
                  <span>Un-Like</span>
                  <v-btn @click="addLike(i)" slot="activator" flat icon style="margin:0px">
                  <v-icon color="red" v-bind:class="{'heart': i.likes && i.likes.length == 0,'heart1': i.likes && i.likes.length == 1,'heart2': i.likes && i.likes.length == 2,'heart3': i.likes && i.likes.length == 3,'heart4': i.likes && i.likes.length == 4,'heart5': i.likes && i.likes.length > 4}">favorite</v-icon><span v-if="i.likes && i.likes.length > 0">{{i.likes.length}}</span>
                  </v-btn>
                </v-tooltip>
              </v-list-tile>
              <div v-if="i.expanded" style="padding-right: 5px; padding-left: 5px;" v-bind:key="i.nid + 'extra'" v-bind:style="{'background-color': (i.user ? i.user.color : ''),'border-bottom': '2px solid rgba(0,0,0,.1)'}">
                <div style="text-align: center">Added by {{i.user ? i.user.name : 'the server'}}</div>
                <div style="text-align: center" v-if="i.likes && i.likes.length > 0"><v-icon style="opacity: .5" color="red">favorite </v-icon><span> by </span><span  v-for="(l, index2) in i.likes" v-bind:key=(index2)>{{l.name}}{{index2 == i.likes.length-1 ? '' : ', '}}</span></div>
              </div>
            </template>
          </v-list>
        <span v-if="aa" style="font-weight: lighter; font-size: 16px; display:block; text-align:center; margin-top: 35px; margin-left: 10px; margin-right: 10px; margin-bottom: 15px;">Auto-adding from {{aa}}.  Search for a new artist or radio station to change!</span>
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
  .heart{
    animation: pulse 1.2s infinite;
  }
  .heart1{
    animation: pulse 1s infinite;
  }
  .heart2{
    animation: pulse .8s infinite;
  }
  .heart3{
    animation: pulse .7s infinite;
  }
  .heart4{
    animation: pulse .6s infinite;
  }
  .heart5{
    animation: pulse .5s infinite;
  }
  .dance{
    opacity: 1;
  }
  @keyframes pulse {
    0% {
      opacity: 1
    }
    85% {
      opacity: .2
    }
    100% {
      opacity: 1
    }
  }
  @keyframes updown{
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .3;
    }
  }
</style>
<script>
  import store from '../vuex/store'
  import axios from 'axios';
  
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
        noSleep: {},
        lyrics: '',
        showLyric: false,
        loadingLyrics: false
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
      },
      user(){
        return store.state.user;
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
      expand(song){
        song.expanded = !song.expanded;
      },
      onlyMasterCan(rest){
        this.snackText = "Only the Master audio controller can " + rest;
        this.snackbar = true;
      },
      addLike(song){
        this.expand(song);
        var payload = {
          user: this.user,
          storeId: song.storeId
        };
        this.$socket.emit('addLike', payload);
      },
      remove(song){
        if(!this.master && (song.user && song.user.id != this.user.id))
          this.onlyMasterCan("skip songs which he or she did not queue");
        var payload = {
          song: song.storeId,
          user: this.user.id
        };
        this.$socket.emit('removeFromQueue', payload);
      },
      showLyrics(){
        this.lyrics = '';
        this.showLyric = !this.showLyric;
        this.loadingLyrics = true;
        axios.get('https://marcderhammer.com/api/lyrics/' + this.nowPlaying.title + ' ' + this.nowPlaying.artist).then(response =>{
          this.lyrics = response.data.lyrics;
          this.loadingLyrics = false;
        });
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
        this.timeRemaining = this.millisToNorm(this.nowPlaying.durationMillis - data.seconds *1000);
        this.timeIn = this.millisToNorm(data.seconds *1000);
        this.songProg = data.percentage;
        this.listeners = data.count;
        this.aa = data.aa;
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