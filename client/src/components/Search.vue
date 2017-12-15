<template>
  <v-container>
    <h2 v-if="searchResults.tracks && searchResults.tracks.length > 0" style="margin-bottom: 5px">Songs</h2>
    <v-layout v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
      <div v-on:click="selectSong(i)" v-for="i in searchResults.tracks" style="margin-right: 15px; width: 120px; height: 158px; text-overflow: ellipsis; cursor:pointer">
        <v-avatar size="115px" :tile="true"  class="grey lighten-4">
          <img :src="i.albumArtRef[0].url"/>
        </v-avatar>
        <br>
        <h4 style="overflow:hidden; text-overflow: ellipsis">{{i.title}}</h4>
        <h5 style="overflow:hidden; text-overflow: ellipsis">{{i.artist}}</h5>
        </div>
      </div>
    </v-layout>
    <!-- Artists -->
    <h2 v-if="searchResults.artists && searchResults.artists.length > 0" style="margin-bottom: 5px; margin-top: 15px;">Artists</h2>
    <v-layout v-cloak aria-rowindex="" style="overflow-y:hidden; white-space: nowrap">
      <div  v-for="i in searchResults.artists" style="margin-right: 15px; width: 120px; height: 158px; text-overflow: ellipsis; cursor:pointer">
        <v-avatar size="115px" :tile="false"  class="grey lighten-4">
          <img style="object-fit: cover" :src="i.artistArtRef"/>
        </v-avatar>
        <br>
        <h4 style="overflow:hidden; text-overflow: ellipsis">{{i.name}}</h4>
        </div>
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
    </v-card>
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
    </v-card>
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
          var stored = localStorage.getItem("Name");
          if(stored){
            name = stored;
            store.commit('CHANGEUSER', name);
          }else{
            name = '';
            store.commit('CHANGEUSER', name);
          }
          
          return {
          
          searchQueryIsDirty: false,
          searching: false,
          selectedSong: {},
          dialog2: false,
          dialog3: false,
          searchResults: store.state.searchResults,
          snackbar: false,
          snackText: '',
          snackTimeout: 2500,
          alertMessage: ''

        }},
        computed: {
            searchTerm () {
              return store.state.searchTerm
            },
            userName(){
              return store.state.userName;
            }
        },
        watch: {
          searchTerm: function(searchTerm){
            this.searching=true;
            this.searchQueryIsDirty = true;
            this.search(searchTerm)
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
          queueSuccess: function(){
            this.dialog2 = false;
          }
        },
        methods: {
          search: debounce(function(search){
            if(search)
              axios.get(`/api/search/` + search).then(response => {
                this.searchResults = response.data;
                this.updateSearch(response.data);
              }).catch(e=>{
                this.searching = false;
                this.searchResults = {"tracks":[{"kind":"sj#track","title":"Good Day","artist":"Jukebox the Ghost","composer":"","album":"Let Live & Let Ghosts","albumArtist":"Jukebox the Ghost","year":2008,"trackNumber":1,"genre":"Alternative/Indie","durationMillis":"254000","albumArtRef":[{"url":"http://lh4.ggpht.com/U8yShtFT1x9bGNlv7Q-o_uyt2B4oiN2ocT02SRHTJHowYnUchUeIdSGMDBWyIVZ63D41YTer2A"}],"discNumber":1,"estimatedSize":"10174198","trackType":"7","storeId":"Tg5gftj7bivfr2si7hirccyyjei","albumId":"tlkasgqjc2vnijmx4cxg5hwuye","artistId":["vx7olm2277qbfxrbrkkamewirm"],"nid":"g5gftj7bivfr2si7hirccyyjei","trackAvailableForSubscription":true,"trackAvailableForPurchase":true,"albumAvailableForPurchase":true,"contentType":"2"},{"kind":"sj#track","title":"Good Day (Live)","artist":"Jukebox the Ghost","composer":"","album":"Long Way Home: Live","albumArtist":"Jukebox the Ghost","year":2016,"trackNumber":1,"genre":"Rock","durationMillis":"296000","albumArtRef":[{"url":"http://lh3.googleusercontent.com/ePElfr9MSPvDUlhyMyKHpesZg1I6UQUcjKKteI9SIHxvrVwxvreTtM3V_f1QYfFcnG1i1VT0wxQ"}],"discNumber":1,"estimatedSize":"11880516","trackType":"7","storeId":"Tspubm7z6uxbahu4iplmkgtfejm","albumId":"f7gh3b3k4zeiysrbcm65vyh6u4","artistId":["fdkpqiyxzvdhv3egmuke3f3kvi"],"nid":"spubm7z6uxbahu4iplmkgtfejm","trackAvailableForSubscription":true,"trackAvailableForPurchase":true,"albumAvailableForPurchase":true,"contentType":"2"},{"kind":"sj#track","title":"Somebody","artist":"Jukebox The Ghost","composer":"","album":"College Radio Day: The Album, Vol. 2","albumArtist":"Various Artists","year":2013,"trackNumber":19,"genre":"Rock","durationMillis":"223000","albumArtRef":[{"url":"http://lh5.ggpht.com/7eN3FEv6uZelw_1UTNscjhsOhG36P4lfhzjmilGISaY2tyJYlU3Ry3Pwcj4gjCM2SbDKPYYrtZs"}],"discNumber":1,"estimatedSize":"8928680","trackType":"7","storeId":"Tzlouc3bnvzvnssi225whbz7lpe","albumId":"7ke3bsomhwdyz3laze6sx4xr6e","artistId":["vx7olm2277qbfxrbrkkamewirm"],"nid":"zlouc3bnvzvnssi225whbz7lpe","trackAvailableForSubscription":true,"trackAvailableForPurchase":true,"albumAvailableForPurchase":true,"contentType":"2"},{"kind":"sj#track","title":"Good Day","artist":"Jukebox the Ghost & Jenny Owen Youngs","composer":"","album":"Jukebox the Ghost & Jenny Owen Youngs","albumArtist":"Jukebox the Ghost & Jenny Owen Youngs","year":2013,"trackNumber":2,"genre":"Rock","durationMillis":"244000","albumArtRef":[{"url":"http://lh5.ggpht.com/5unzhTeLvUErFCK0G0DJC5OJ7ST_XtnS_8b3Huqj7mu4EwV7w8IPzBk-pfk-JDTAqxYJh89t"}],"discNumber":1,"estimatedSize":"9772957","trackType":"7","storeId":"Tzv5i6ve4wouehh735t6y7575me","albumId":"pn5zo6s3szatpqp6zvte3mapym","artistId":["pstp3lian3cq2dm6gx5vmnjb6y"],"nid":"zv5i6ve4wouehh735t6y7575me","trackAvailableForSubscription":true,"trackAvailableForPurchase":true,"albumAvailableForPurchase":true,"contentType":"2"}],"artists":[{"kind":"sj#artist","name":"Jukebox The Ghost","artistArtRef":"http://lh3.googleusercontent.com/BqUqp2RwcHxusrOsdZFaNwdebi4gFjqaJV7mobqOGAORM37G70DLarslOLXNLt662fzJj4SS","artistId":"Avx7olm2277qbfxrbrkkamewirm","artist_bio_attribution":{"kind":"sj#attribution","source_title":"Wikipedia","source_url":"https://en.wikipedia.org/wiki/Jukebox_the_Ghost","license_title":"Creative Commons Attribution CC-BY-SA 4.0","license_url":"http://creativecommons.org/licenses/by-sa/4.0/legalcode"}}],"albums":[{"kind":"sj#album","name":"Let Live & Let Ghosts","albumArtist":"Jukebox the Ghost","albumArtRef":"http://lh4.ggpht.com/U8yShtFT1x9bGNlv7Q-o_uyt2B4oiN2ocT02SRHTJHowYnUchUeIdSGMDBWyIVZ63D41YTer2A","albumId":"Btlkasgqjc2vnijmx4cxg5hwuye","artist":"Jukebox the Ghost","artistId":["Avx7olm2277qbfxrbrkkamewirm"],"year":2008}],"playlists":[],"radios":[{"kind":"sj#radioStation","name":"Let Live & Let Ghosts","seed":{"kind":"sj#radioSeed","albumId":"Btlkasgqjc2vnijmx4cxg5hwuye","seedType":"4"},"imageUrls":[{"url":"http://lh4.ggpht.com/U8yShtFT1x9bGNlv7Q-o_uyt2B4oiN2ocT02SRHTJHowYnUchUeIdSGMDBWyIVZ63D41YTer2A"}]},{"kind":"sj#radioStation","name":"Jukebox The Ghost","seed":{"kind":"sj#radioSeed","artistId":"Avx7olm2277qbfxrbrkkamewirm","seedType":"3"},"imageUrls":[{"url":"http://lh3.googleusercontent.com/BqUqp2RwcHxusrOsdZFaNwdebi4gFjqaJV7mobqOGAORM37G70DLarslOLXNLt662fzJj4SS"}]},{"kind":"sj#radioStation","name":"Good Day","seed":{"kind":"sj#radioSeed","trackId":"Tg5gftj7bivfr2si7hirccyyjei","seedType":"2"},"imageUrls":[{"url":"http://lh4.ggpht.com/U8yShtFT1x9bGNlv7Q-o_uyt2B4oiN2ocT02SRHTJHowYnUchUeIdSGMDBWyIVZ63D41YTer2A"}]},{"kind":"sj#radioStation","name":"Good Day (Live)","seed":{"kind":"sj#radioSeed","trackId":"Tspubm7z6uxbahu4iplmkgtfejm","seedType":"2"},"imageUrls":[{"url":"http://lh3.googleusercontent.com/ePElfr9MSPvDUlhyMyKHpesZg1I6UQUcjKKteI9SIHxvrVwxvreTtM3V_f1QYfFcnG1i1VT0wxQ"}]},{"kind":"sj#radioStation","name":"Somebody","seed":{"kind":"sj#radioSeed","trackId":"Tzlouc3bnvzvnssi225whbz7lpe","seedType":"2"},"imageUrls":[{"url":"http://lh5.ggpht.com/7eN3FEv6uZelw_1UTNscjhsOhG36P4lfhzjmilGISaY2tyJYlU3Ry3Pwcj4gjCM2SbDKPYYrtZs"}]}]}
                this.updateSearch(this.searchResults);
              });
              this.searching = false; 
          }, 350),
          selectSong: function(s){
            var d = new Date(1000*Math.round(s.durationMillis/1000));
            var mins = d.getUTCMinutes();
            var secs = d.getUTCSeconds();
            s.minSec = mins + ":" + (secs < 10 ? "0" : "") + secs;
            this.selectedSong = s;
            this.dialog2 = true;
          },
          updateSearch (wo){
            store.commit('RESULTCHANGE', wo);
          },
          addToQueue(){
            var song = this.selectedSong;
            if(this.userName){
              console.log('setting username to ' + this.userName);
              song.user = this.userName;
            }
            this.$socket.emit('addSongToQueue', song);
            this.dialog3 = false;
          }
        }
      }
    
</script>