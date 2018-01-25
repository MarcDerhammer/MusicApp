// Include the server in your file
const server = require('server');
var io = require('socket.io-client');
var socket = io.connect('https://marcderhammer.com:3001', {reconnect: true});

var pm = require('./play');
const { get, post } = server.router;
const { render } = server.reply;

// Handle requests to the url "/" ( http://localhost:3000/ )
const getSearch = get('/search/:search', async ctx => {
    var songs = await pm.search(ctx.params.search);
    if(songs)
        return songs;
    return 'No results';
});

const getArtist = get('/artist/:id', async ctx => {
    var artists = await pm.artistLookup(ctx.params.id);
    if(artists)
        return artists;
    return 'No results';
});

const getAlbum = get('/album/:id', async ctx => {
    var album = await pm.albumLookup(ctx.params.id);
    if(album)
        return album;
    return 'No results';
});

const getStreamUrl = get('/stream/:id', async ctx => {
    var stream = await pm.artistLookup(ctx.params.id);
    if(stream)
        return stream;
    return 'No results';
});

const getStation = get('/station/:id', async ctx =>{
    var station = await pm.getStation(ctx.params.id);
    if(station){
        return station;
    }
    return 'No results';
});

const createStation = get('/createStation/:id/:type', async ctx =>{
    var station = await pm.createStation(ctx.params.id, ctx.params.type);
    if(station){
        return station;
    }
    return 'No';
});

socket.on('connect', function(socket){

});

const downloadStream = get('/downloadStream/:id', async ctx => {
    for(var i = 0; i < 5; i++){
        var id = await pm.downloadSong(ctx.params.id);
        if(id){
            return id;
        }else{
            console.log('Retry # ' + i+1 + ' : Download failed for: ' + ctx.params.id);
        }
    }

    console.log('attempting to dequeue!!');
    
    socket.emit('removeFromQueue', ctx.params.id);
    
    return 'No results';
});

server(
  getSearch,
  getArtist,
  getAlbum,
  getStreamUrl,
  downloadStream,
  getStation,
  createStation
);