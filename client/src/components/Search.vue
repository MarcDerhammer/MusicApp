<template>
  <v-container fluid style="padding: 15px;">
    <v-layout align-center justify-center>
      <v-progress-circular class="text-md-center" align-center v-if="searching" indeterminate v-bind:size="75" color="primary"></v-progress-circular>
    </v-layout>
    <span v-if="noResults && !searching && rendered">No results...</span>
    <h2 v-if="rendered && !searching && searchResults.tracks && searchResults.tracks.length > 0" style="margin-bottom: 5px">Songs</h2>
    <v-layout v-if="!searching" v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
      <div v-on:click="selectSong(i)" v-bind:key="i.storeId" v-for="i in searchResults.tracks" style="margin-right: 15px; width: 120px; height: 174px; text-overflow: ellipsis; cursor:pointer">
        <v-avatar size="115px" :tile="true"  class="grey lighten-4">
          <img :src="i.albumArtRef && i.albumArtRef[0].url"/>
        </v-avatar>
        <br>
        <h4 style="overflow:hidden; text-overflow: ellipsis">{{i.title}}</h4>
        <h5 style="overflow:hidden; text-overflow: ellipsis">{{i.artist}}</h5>
        <v-icon v-if="i.contentType==='1'">explicit</v-icon>
      </div>
    </v-layout>
    <!-- Artists -->
    <h2 v-if="rendered && !searching && searchResults.artists && searchResults.artists.length > 0" style="margin-bottom: 5px; margin-top: 15px;">Artists</h2>
    <v-layout v-if="!searching" v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
      <div @click="artistLookup(i.artistId)" v-bind:key="i.artistId" v-for="i in searchResults.artists" style="margin-right: 15px; width: 120px; height: 158px; text-overflow: ellipsis; cursor:pointer">
        <v-avatar size="115px" :tile="false"  class="grey lighten-4">
          <img style="object-fit: cover" :src="i.artistArtRef"/>
        </v-avatar>
        <br>
        <h4 style="overflow:hidden; text-overflow: ellipsis; text-align: center">{{i.name}}</h4>
      </div>
    </v-layout>

    <h2 v-if="rendered && !searching && searchResults.albums && searchResults.albums.length > 0" style="margin-bottom: 5px; margin-top: 15px;">Albums</h2>
    <v-layout v-if="!searching" v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
      <div @click="albumLookup(i.albumId)" v-bind:key="i.albumId" v-for="i in searchResults.albums" style="margin-right: 15px; width: 120px; height: 158px; text-overflow: ellipsis; cursor:pointer">
        <v-avatar size="115px" :tile="false"  class="grey lighten-4">
          <img style="object-fit: cover" :src="i.albumArtRef"/>
        </v-avatar>
        <br>
        <h4 style="overflow:hidden; text-overflow: ellipsis; text-align: center">{{i.name}}</h4>
      </div>
    </v-layout>

    <h2 v-if="rendered && !searching && searchResults.radios && searchResults.radios.length > 0" style="margin-bottom: 5px; margin-top: 15px;">Stations</h2>
    <v-layout v-if="!searching" v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
      <div @click="radioLookup(i)" v-bind:key="i.kind + i.name" v-for="i in searchResults.radios" style="margin-right: 15px; width: 120px; height: 158px; text-overflow: ellipsis; cursor:pointer">
        <v-avatar size="115px" :tile="false"  class="grey lighten-4">
          <img v-if="i.imageUrls && i.imageUrls[0]" style="object-fit: cover" :src="i.imageUrls[0].url"/>
        </v-avatar>
        <br>
        <h4 style="overflow:hidden; text-overflow: ellipsis; text-align: center">{{i.name}}</h4>
      </div>
    </v-layout>
  <v-dialog v-model="dialog2" max-width="500px">
    <v-flex xs12>
      <v-card v-if="selectedSong && selectedSong.albumArtRef"  class="white--text">
        <v-container fluid grid-list-lg>
          <v-layout row>
            <v-flex>
              <div>
                <div class="headline">{{selectedSong.title}}</div>
                <h3>{{selectedSong.artist}}</h3>
                <h4>{{selectedSong.album}} ({{selectedSong.year}})</h4>
                <h4>{{selectedSong.minSec}}</h4>
              </div>
            </v-flex>
            <v-flex xs7>
                <v-card-media
                  :src="selectedSong.albumArtRef[0].url"
                  height="175px"
                  contain
                ></v-card-media>
            </v-flex>
          </v-layout>
        </v-container>
        <v-container>
          <v-card-actions>
            <v-btn color="primary" @click.stop="addToQueue()">Add to Queue<v-icon>queue_music</v-icon></v-btn>
            <v-btn @click.stop="dialog2=false">Close</v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-flex>
  </v-dialog>

<v-dialog v-model="artistDialog" max-width="500px">
  <v-flex xs12>
    <v-card v-if="artistResult && artistResult.artistArtRef"  class="white--text">
      <v-container fluid grid-list-lg>
        <v-layout column>
          <v-flex xs12>
              <v-card-media
                :src="artistResult.artistArtRef"
                height="175px"
                contain
              ></v-card-media>
          </v-flex>
          <v-layout align-center justify-center>
            <div>
              <div class="headline">{{artistResult.name}}</div>
              
            </div>
          </v-layout>
          <v-layout align-center justify-center>
            <v-btn @click="rad(artistResult.artistId, 'artist', artistResult.name + ' radio')" color="primary">Set as Radio (Auto-Add)</v-btn>
          </v-layout>
          <h3 v-if="artistResult.topTracks && artistResult.topTracks.length > 0" style="margin-bottom: 5px">Top Songs</h3>
          <v-layout v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
            <div v-on:click="selectSong(i)" v-bind:key="i.storeId" v-for="i in artistResult.topTracks" style="margin-left: 7px; margin-right: 7px; width: 120px; height: 158px; text-overflow: ellipsis; cursor:pointer">
              <v-avatar size="100px" :tile="true"  class="grey lighten-4">
                <img :src="i.albumArtRef[0].url"/>
              </v-avatar>
              <br>
              <h5 style="overflow:hidden; text-overflow: ellipsis">{{i.title}}</h5>
              <v-icon v-if="i.contentType==='1'">explicit</v-icon>
            </div>
          </v-layout>

          <h3 v-if="artistResult.albums && artistResult.albums.length > 0" style="margin-bottom: 5px">Albums</h3>
          <v-layout v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
            <div v-on:click="albumLookup(i.albumId)" v-bind:key="i.storeId" v-for="i in artistResult.albums" style="margin-left: 7px; margin-right: 7px; width: 120px; height: 158px; text-overflow: ellipsis; cursor:pointer">
              <v-avatar size="100px" :tile="true"  class="grey lighten-4">
                <img :src="i.albumArtRef"/>
              </v-avatar>
              <br>
              <h5 style="overflow:hidden; text-overflow: ellipsis">{{i.name}}</h5>
              <h6 style="overflow:hidden; text-overflow: ellipsis">{{i.year}}</h6>
            </div>
          </v-layout>

          <h3 v-if="artistResult.related_artists && artistResult.related_artists.length > 0" style="margin-bottom: 5px; margin-top: 15px;">Similar Artists</h3>
          <v-layout v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
            <div @click="artistLookup(i.artistId)" v-bind:key="i.artistId" v-for="i in artistResult.related_artists" style="margin-right: 15px; width: 120px; height: 158px; text-overflow: ellipsis; cursor:pointer">
              <v-avatar size="100px" :tile="false"  class="grey lighten-4">
                <img style="object-fit: cover" :src="i.artistArtRef"/>
              </v-avatar>
              <br>
              <v-layout align-center justify-center>
                <h5 style="overflow:hidden; text-overflow: ellipsis">{{i.name}}</h5>
              </v-layout>
            </div>
          </v-layout>
        </v-layout>
      </v-container>
      <v-container>
        <v-card-actions>
          <v-btn @click.stop="artistDialog=false">Close</v-btn>
        </v-card-actions>
      </v-container>
    </v-card>
  </v-flex>
</v-dialog>

<v-dialog v-model="albumDialog" max-width="500px">
  <v-flex xs12>
    <v-card v-if="albumResult && albumResult.albumArtRef"  class="white--text">
      <v-container fluid grid-list-lg>
        <v-layout column>
          <v-flex xs12>
              <v-card-media
                :src="albumResult.albumArtRef"
                height="175px"
                contain
              ></v-card-media>
          </v-flex>
          <v-layout align-center justify-center>
              <div class="headline">{{albumResult.name}}</div>
          </v-layout>
          <v-layout align-center justify-center>
              <div>{{albumResult.year}}</div>
          </v-layout>
          <h3 v-if="albumResult.tracks && albumResult.tracks.length > 0" style="margin-bottom: 5px">Tracks</h3>
          <v-layout column v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
            <v-list>
              <template v-for="i in albumResult.tracks">
                <v-list-tile v-bind:key="i.storeId" @click="selectSong(i)">
                  <v-list-tile-content flex>
                    <span style="display: inline">{{i.title}}</span>
                  </v-list-tile-content>
                    <v-icon v-if="i.contentType==='1'">explicit&nbsp;&nbsp;</v-icon>
                    <span>{{i.normTime}}</span>
                </v-list-tile>
              </template>
            </v-list>
          </v-layout>
        </v-layout>
      </v-container>
      <v-container>
        <v-card-actions>
          <v-btn color="primary" @click.stop="addAlbumToQueue()">Add Album to Queue<v-icon>queue_music</v-icon></v-btn>
          <v-btn @click.stop="albumDialog=false">Close</v-btn>
        </v-card-actions>
      </v-container>
    </v-card>
  </v-flex>
</v-dialog>

<v-dialog v-model="radioDialog" max-width="500px">
  <v-flex xs12>
    <v-card v-if="radioResult"  class="white--text">
      <v-container fluid grid-list-lg>
        <v-layout column>
          <v-layout align-center justify-center>
              <div class="headline">{{radioResult.name}}</div>
          </v-layout>
          <v-layout align-center justify-center>
              <div>Radio Station</div>
          </v-layout>
          <v-layout style="padding: 25px" align-center justify-center v-if="radioResult.description">
              <span>{{radioResult.description}}</span>
          </v-layout>
        </v-layout>
      </v-container>
      <v-container>
        <v-card-actions>
          <v-btn v-if="radioResult && radioResult.seed && radioResult.seed.curatedStationId" color="primary" @click.stop="rad(radioResult.seed.curatedStationId, 'station', radioResult.name)">Set as Radio Station</v-btn>
          <v-btn v-if="radioResult && radioResult.seed && radioResult.seed.artistId" color="primary" @click.stop="rad(radioResult.seed.artistId, 'artist', radioResult.name)">Set as Artist Radio Station</v-btn>
          <v-btn @click.stop="radioDialog=false">Close</v-btn>
        </v-card-actions>
      </v-container>
    </v-card>
  </v-flex>
</v-dialog>

<v-dialog v-model="dialog3" max-width="500px">
      <v-flex xs12>
        <v-card v-if="alertMessage"  class="white--text">
          <v-container fluid grid-list-lg>
            <v-layout row>
              <v-flex>
                <div>
                  <div class="headline">{{alertMessage.primary}}</div>
                  <span v-if="alertMessage.secondary">{{alertMessage.secondary}}</span>
                </div>
              </v-flex>
            </v-layout>
          </v-container>
          <v-container>
            <v-card-actions>
              <v-btn @click.stop="dialog3=false">k..</v-btn>
            </v-card-actions>
          </v-container>
        </v-card>
      </v-flex>
  </v-dialog>

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
    var debounce = require('debounce');
    import axios from 'axios'
   
    
    export default {
        data () {
          return {
          searching: false,
          selectedSong: {},
          dialog2: false,
          dialog3: false,
          searchResults: store.state.searchResults,
          snackbar: false,
          snackText: '',
          snackTimeout: 2500,
          alertMessage: '',
          noResults: false,
          artistDialog: false,
          artistResult: {},
          albumResult: {},
          albumDialog: false,
          radioResult: {},
          radioDialog: false,
          rendered: true

        }},
        computed: {
            searchTerm () {
              return store.state.searchTerm
            },
            user(){
              return store.state.user;
            },
            master(){
              return store.state.master;
            }
        },
        watch: {
          searchTerm: function(searchTerm){
            /*this.searching=true;
            this.search(searchTerm)*/
          }
        },
        sockets: {
          alertMessage: function(data){
            this.dialog3 = true;
            this.alertMessage = data;
          },
          toastMessage: function(data){
            this.snackText = data;
            this.snackbar = true;
          },
          queueSuccess: function(id){
            this.dialog2 = false;
          }
        },
        mounted(){
          var v = this;
          EventBus.$on('search', function(wo){
            v.search(wo);
          }.bind(this));
        },
        beforeDestroy(){
          EventBus.$off('search');
        },
        methods: {
          rad: function(id, type, name){
            var aa = {
              type: type,
              id: id,
              name: name
            }
            this.$socket.emit('setAA', aa);
          },
          search: (function(search){
            if(search){
                this.searching = true;
                var par = this;
                axios.get('https://marcderhammer.com/api/search/' + search).then(response => {
                  this.searchResults = response.data;
                  this.noResults = false;
                  this.updateSearch(response.data);
                  this.rendered = true;
                  this.searching = false;
                  console.log('done search');
                  if(!this.searchResults || (this.searchResults.tracks.length === 0 && this.searchResults.artists.length === 0 && this.searchResults.albums.length === 0 && this.searchResults.radios.length === 0)){
                    console.log('NO results');
                    this.noResults = true;
                  }
                  this.$nextTick().then(function(){
                    console.log('done rendering');
                    par.rendered = true;
                  });
                }).catch(e=>{
                  this.searching = false;
                  this.rendered = false;
                  this.searchResults = {}
                  this.updateSearch(this.searchResults);
                });
            }
          }),
          artistLookup: function(id){
            this.searching = true;
            axios.get('https://marcderhammer.com/api/artist/' + id).then(response => {
              this.artistResult = response.data;
              this.searching = false;
              console.log(this.artistResult);
              this.artistDialog = true;
            }).catch(e=>{
              this.searching = false;
              console.log(e);
            });
          },
          albumLookup: function(id){
            axios.get('https://marcderhammer.com/api/album/' + id).then(response => {
              response.data.tracks.forEach(element => {
                element.normTime = this.millisToNorm(element.durationMillis);
              });
              this.albumResult = response.data;
              console.log(this.albumResult);
              this.albumDialog = true;
            }).catch(e=>{
              console.log(e);
            });
          },
          radioLookup: function(id){
            this.radioResult = id;
            this.radioDialog = true;
          },
          millisToNorm: function(dur){
            var d = new Date(1000*Math.round(dur/1000));
            var mins = d.getUTCMinutes();
            var secs = d.getUTCSeconds();
            return mins + ":" + (secs < 10 ? "0" : "") + secs;
          },
          selectSong: function(s){
            s.minSec = this.millisToNorm(s.durationMillis);
            this.selectedSong = s;
            this.dialog2 = true;
          },
          updateSearch (wo){
            store.commit('RESULTCHANGE', wo);
          },
          addToQueue(){
            var song = this.selectedSong;
            song.user = this.user;
            this.$socket.emit('addSongToQueue', song);
            this.dialog3 = false;
          },
          addAlbumToQueue(){
            
            var album = this.albumResult;
            var socket = this.$socket;
            var user = this.user;
            album.tracks.forEach(function(obj){
                obj.isAlbum = true;
                obj.user = user;
                socket.emit('addSongToQueue', obj);
            });
            this.albumDialog = false;
          }
        }
      }

    
    
</script>