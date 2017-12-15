<template>
  <v-app dark>
    <v-toolbar fixed app :clipped-left="clipped">
      <v-spacer></v-spacer>
      <h2 v-if="e1 !== 'Search'">{{e1}}</h2>
      <SearchBar v-if="e1 === 'Search'"></SearchBar>
      <v-spacer></v-spacer>
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
    </v-bottom-nav>
  </v-app>
</template>

<script>
  import SearchBar from './components/SearchBar'
  export default {
    data () {
      return {
        clipped: false,
        e1: 'Queue'
      }
    },
    components:{
      SearchBar
    }
  }

</script>
