<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <h4>Now Playing:</h4>
        <v-flex style="width: 500px" v-if="nowPlaying" xs12>
          <v-card class="white--text">
            <v-container fluid grid-list-lg>
              <v-layout row>
                <v-flex xs7>
                  <div style="max-height: 175px; overflow: hidden; text-overflow: ellipsis">
                    <div class="headline">{{nowPlaying.title}}</div>
                    <div>{{nowPlaying.artist}}</div>
                    <div>{{nowPlaying.album}} ({{nowPlaying.year}})</div>
                    <div v-if="nowPlaying.user" style="opacity: .6;">Queued by {{nowPlaying.user}}</div>
                  </div>
                </v-flex>
                <v-flex xs7>
                    <v-card-media
                      :src="nowPlaying.albumArtRef[0].url"
                      height="175px"
                      contain
                    ></v-card-media>
                </v-flex>
              </v-layout>
              <v-layout style="cursor: pointer" row v-if="listening">
                <v-icon @click='setVolume(100)' v-if="volume == 0" style="margin-right: 25px">volume_mute</v-icon>
                <v-icon @click='setVolume(0)' v-if="volume !== 0" style="margin-right: 25px">volume_up</v-icon>
                <v-slider @input='updateVolume()' v-model="volume" step="0"></v-slider>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <v-icon @click="downvote(nowPlaying)" class="vote">thumb_down</v-icon>&nbsp;&nbsp;
                <v-icon @click="upvote(nowPlaying)" class="vote">thumb_up</v-icon>
                <v-icon v-if="username.indexOf('Marc')>= 0" @click="remove(nowPlaying)" class="vote">&nbsp;delete</v-icon>
              </v-layout>
              
            </v-container>
            <v-progress-linear v-model="songProg"></v-progress-linear>
          </v-card>
        </v-flex>
        <!--<v-flex><v-btn @click="showQueue()">Queue</v-btn><v-btn @click="showChat()">Chat <span style="color:red" v-if="unreadMessages > 0"> ({{unreadMessages}})</span></v-btn></v-flex>-->
        <v-flex xs12 >
          <v-list two-line style="max-width: 500px; ">
            <template v-if="index !== 0" style="max-width: 500px" v-for="(i, index) in queue">
              <v-list-tile avatar v-bind:key="i.nid" >
                <v-list-tile-avatar>
                  <img v-bind:src="i.albumArtRef[0].url">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title style="overflow:hidden; text-overflow: ellipsis" v-html="i.title"></v-list-tile-title>
                  <v-list-tile-sub-title style="overflow:hidden; text-overflow: ellipsis" v-html="i.artist"></v-list-tile-sub-title>
                </v-list-tile-content>
                <v-progress-circular indeterminate color="primary" v-if="!i.downloaded"></v-progress-circular>
                <v-icon @click="downvote(i)" class="vote">thumb_down</v-icon>&nbsp;&nbsp;
                <v-icon @click="upvote(i)" class="vote">thumb_up</v-icon>
                <v-icon v-if="username.indexOf('Marc')>= 0" @click="remove(i)" class="vote">&nbsp;delete</v-icon>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>
        <!--
        <v-flex v-if="!showingQueue" xs12 style="max-height: 200px; overflow-y: auto" >
          <v-list style="max-width: 500px; ">
            <template style="max-width: 500px" v-for="i in queue">
              <v-list-tile v-bind:key="i.nid" >
                  <span style="text-overflow: break-word" >{{i.artist}}: {{i.title}}</span>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>-->
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
  }
</style>
<script>
  import store from '../vuex/store'
  export default {
    data () {
      return {
        songProg: 0,
        snackTimeout: 2500,
        snackbar: false,
        snackText: '',
        volume: store.state.volume
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
      username(){
        return store.state.userName;
      }
    },
    
    methods: {

      remove(song){
        this.$socket.emit('removeFromQueue', song.storeId);
      },
      upvote(song){
        this.snackText = "Voting doesn't work yet";
        this.snackbar = true;
      },
      downvote(song){
        this.upvote(song);
      },
      setVolume(val){
        this.volume = val;
        store.commit('VOLUME', val);
      },
      updateVolume(){
        store.commit('VOLUME', this.volume);
      },
      joinAudio(){
        store.commit('JOINAUDIO', true);
        this.$socket.emit('joinAudio', 'hey');
      },
      leaveAudio(){
        store.commit('LEAVEAUDIO')
        this.$socket.emit('leaveAudio', 'hey');
      }
    },
    sockets: {
      songProg: function(data){
        this.songProg = data.percentage;
      }
    },
    watch: {
      
    }
  }
  
</script>