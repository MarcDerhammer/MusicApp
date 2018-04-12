<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <span>You are:</span>
          <v-flex xs12 sm5 >
            <!--todo.. fix the first keypress issue thing..-->
          <v-text-field 
            required
            maxlength="30"
            v-model= "user.name"
            @input = "setName()" 
            label="Enter your name" 
            class="input-group--focused" 
            single-line
            autofocus
            >
          </v-text-field>
          </v-flex>
          <span>Select Color</span>
          <swatches @input="setName()" show-border v-on:click="setName()" style="max-width: 500px" inline  colors="material-dark" v-model="user.color" />
          <span v-if="user.name" style="font-weight: light; text-align: center; opacity: .75">Songs you queue will look like this:</span>

<v-flex style="width: 500px" xs12 >
          <v-list two-line style="max-width: 500px; ">
            <template>
              <v-list-tile v-bind:style="{'background-color': user.color}" avatar >
                <v-list-tile-avatar>
                  <img src="https://lh3.googleusercontent.com/fFY1ATMkKWK4iDcUx96emZrMecvMK8jBQKG3wmgIuDx1PECoHzGuuil_D1QBr3VvqyDJlu7BZrw">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title style="overflow:hidden; text-overflow: ellipsis" html="In Da Club">In Da Club</v-list-tile-title>
                  <v-list-tile-sub-title style="overflow:hidden; text-overflow: ellipsis" html="50 Cent">50 Cent</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-tooltip top > 
                  <span>Added by {{user.name}}</span>
                  <v-btn disabled slot="activator" flat icon>
                  <v-icon>person </v-icon>
                  </v-btn>
                  </v-tooltip>
              </v-list-tile>
            </template>
          </v-list>
</v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>
<script>
import store from "../vuex/store";
import Swatches from "vue-swatches";
import "vue-swatches/dist/vue-swatches.min.css";
export default {
  components: { Swatches },
  data() {
    return {
      pingback: "",
      pingtime: 0
    };
  },
  computed: {
    user() {
      return store.state.user;
    },
    queue(){
      return store.state.queue;
    }
  },
  methods: {
    ping: function() {
      this.pingtime = new Date().getTime();
      this.$socket.emit("pinger", "no");
      this.$socket.emit("songProgUpdate", 75);
    },
    setName: function() {
      if (this.user.name) store.commit("UPDATEUSER", this.user);
      this.$socket.emit("userInfoChanged", this.user);
      store.commit('UPDATEUSERINFO', this.user);
    }
  },
  sockets: {
    pingback: function(data) {
      this.pingback = data;
      this.pingtime = new Date().getTime() - this.pingtime;
    }
  }
};
</script>