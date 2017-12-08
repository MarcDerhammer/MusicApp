<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <span>Search page</span>
        <span>{{searchTerm}}</span>
        <span v-if="searching">Searching...</span>
        <span></span>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>
<script>
    import store from '../vuex/store'
    var debounce = require('debounce');
    import axios from 'axios'
    export default {
        data () {return {
          searchQueryIsDirty: false,
          searching: false
        }},
        computed: {
            searchTerm () {
              return store.state.searchTerm
            }
        },
        watch: {
          searchTerm: function(searchTerm){
            this.searching=true;
            this.searchQueryIsDirty = true;
            this.search(searchTerm)
          }
        },
        methods: {
          search: debounce(function(search){
            axios.get(`/api/search/` + search).then(response => {
              console.log(response.data);
            }).catch(e=>{
              console.log(e);
            });
            this.searching = false; 
          }, 350)
        }
      }
    
</script>