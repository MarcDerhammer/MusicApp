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
                  <div>
                    <div class="headline">{{nowPlaying.title}}</div>
                    <div>{{nowPlaying.artist}}</div>
                    <div>{{nowPlaying.album}} ({{nowPlaying.year}})</div>
                    <div v-if="nowPlaying.user" style="opacity: .6">Queued by {{nowPlaying.user}}</div>
                    <!--<v-btn v-if="!listening" @click="joinAudio()">Join Audio <v-icon>volume_up</v-icon></v-btn>
                    <v-btn v-if="listening" @click="leaveAudio()">Leave Audio <v-icon>volume_off</v-icon></v-btn>-->
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
              
            </v-container>
            
            <v-progress-linear v-model="songProg"></v-progress-linear>
          </v-card>
        </v-flex>
        <v-list two-line style="max-width: 500px">
          <v-subheader>Queue</v-subheader>
          <template v-for="i in queue">
            <v-list-tile avatar v-bind:key="i.nid" @click="">
              <v-list-tile-avatar>
                <img v-bind:src="i.albumArtRef[0].url">
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-html="i.title"></v-list-tile-title>
                <v-list-tile-sub-title v-html="i.artist"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
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

<script>
  import store from '../vuex/store'
  export default {
    data () {
      return {
        songProg: 0,
        snackTimeout: 2500,
        snackbar: false,
        snackText: ''
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
      }
    },
    methods: {
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