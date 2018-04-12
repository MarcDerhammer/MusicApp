# MusicApp
Made this to learn VueJS and mess around with some NodeJS backend.

Basically, a jukebox app which has two main features:
* Users can add songs to the queue
* Users can "join" the audio to have a synchronized listening experience

### Front end
* VueJS (with Vuetify style) 
* I just used the PWA template and built off that.  Super easy and fun.  

### Backend
* General
  * My app is hosted in a cheapo OVH VPS running Ubuntu Server 14.04
* Static Web
  * Using nginx to serve the static content
    * I had to forward requests with /api/ in them to my Express API server port... I tried to do something similar with socketio server and it gave me a huge headache so I gave up eventually and just hit the port manually.  I had successfully done it (and with SSL) on another unrelated app but I couldn't get this one to play nice.  Maybe one day I'll fix it.
  * SSL by LetsEncrypt (yay) 
  
* Express API
  * Code in /server/express_api
  * play.js is a thing I wrote ages ago to wrap most of the stuff in [this amazing Google Play Music package](https://github.com/jamon/playmusic)
  * I could probably refactor it to not use my silly play.js but in this moment I'm in too deep
  * index.js is just a basic api to access my stuff in play.js
  * Oh and I'm using [serverjs.io](https://serverjs.io/) (which is so much cleaner to use than straight up express)
* Socket.io Server
  * By far the ugliest code
  * Keeps track of the queue and song progress
 
 
 
 ##Todo:
 * Better "radio" currently only artist stations and actual gmusic stations can auto-add
 * Fix upvote/downvote thing... should they change order?  Maybe
