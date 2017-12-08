<template>
    <v-flex xs12 sm5 >
        <v-text-field 
          v-model= "searchTerm"
          @input = "editSearch(searchTerm)" 
          autofocus 
          style="margin-top:15px;" 
          label="Search music" 
          class="input-group--focused" 
          append-icon="search" 
          single-line>
      </v-text-field>
    </v-flex>
</template>
<script>
    import store from '../vuex/store'
    export default {
        methods: {
            editSearch (wo) {
                store.commit('CHANGE', wo)
            }
        },
        data () {
            return {
                searchTerm: store.state.searchTerm
            }
        }
    }
</script>