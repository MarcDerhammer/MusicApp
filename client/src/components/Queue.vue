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
  </v-container>
</template>

<script>
  import store from '../vuex/store'
  export default {
    data () {
      return {
        songProg: 0
      }
    },
    computed: {
      queue() {
        return store.state.songQueue
      },
      nowPlaying(){
        return store.state.songQueue[0]
      }
    },
    methods: {

    },
    sockets: {
      songProg: function(data){
        this.songProg = data;
      }
    },
    watch: {
      
    }
  }
  
</script>