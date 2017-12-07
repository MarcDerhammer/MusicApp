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

server(
  getSearch,
  getArtist
);