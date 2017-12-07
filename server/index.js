// Include the server in your file
const server = require('server');
var pm = require('./play');
const { get, post } = server.router;

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
    var album = await pm.artistLookup(ctx.params.id);
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

const downloadStream = get('/downloadStream/:id', async ctx => {
    var id = await pm.downloadSong(ctx.params.id);
    if(id)return id;
    return 'No results';
});

server(
  getSearch,
  getArtist,
  getAlbum,
  getStreamUrl,
  downloadStream


);