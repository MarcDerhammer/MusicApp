var PlayMusic = require('playmusic');
var secrets = require('./secrets');
var pm = new PlayMusic();
var https = require('https');
var fs = require('fs');
/*goog types: 
1 = track 
2 = artist
3 = album
4 = playlist
5 = ??
6 = radio station
7 = ??
8 = youtube video
*/
var creds = {email: secrets.email, androidId: secrets.androidId, masterToken: secrets.masterToken};

var search = function(searchTerm){
    return new Promise(function(resolve, reject){
        pm.init(creds, function(err) {
        if(err) console.error(err);

            pm.search(searchTerm, 25, function(err, data){
                if(err){
                    resolve(null);
                    console.log(err)
                };
                if(!data.entries){
                    resolve(null);
                    return;
                }
                var songs = data.entries;
                console.log('Search for ' + searchTerm + " returned "  + songs.length + " results");
                var result = {};
                result.tracks = [];
                result.artists = [];
                result.albums = [];
                result.playlists = [];
                result.radios = [];
                songs.forEach(function(song){
                    if(song.type == '1'){
                        result.tracks.push(song.track);
                    }
                    if(song.type=='3'){
                        result.albums.push(song.album);
                    }
                    if(song.type=='2'){
                        result.artists.push(song.artist);
                    }
                    if(song.type=='4'){
                        result.playlists.push(song.playlist);
                    }
                    if(song.type=='6'){
                        result.radios.push(song.station);
                    }
                });

                if(result.tracks){
                    result.tracks.forEach(function(obj){
                        if(obj.albumArtRef && obj.albumArtRef[0]){
                            obj.albumArtRef[0].url = obj.albumArtRef[0].url.replace('http://', 'https://');
                        }
                    });
                }

                if(result.artists){
                    result.artists.forEach(function(obj){
                        if(obj.artistArtRef){
                            obj.artistArtRef = obj.artistArtRef.replace('http://', 'https://');
                        }
                    });
                }

                if(result.albums){
                    result.albums.forEach(function(obj){
                        if(obj.albumArtRef){
                            obj.albumArtRef = obj.albumArtRef.replace('http://', 'https://');
                        }
                    });
                }

                if(result.radios){
                    result.radios.forEach(function(r){
                        if(r.imageUrls){
                            r.imageUrls.forEach(function(i){
                                i.url = i.url.replace('http://', 'https://');
                            });
                        }
                    });
                }

                resolve(result);
            });
        });
    });
}

var artistLookup = function(artistId){
    return new Promise(function(resolve, reject){
        pm.init(creds, function(err){
            if(err)console.log(err);
            pm.getArtist(artistId, true, 10, 10, function(err, artistInfo){
                if(err){
                    resolve(null);
                    console.log(err);
                }
                if(artistInfo.artistArtRef){
                    artistInfo.artistArtRef = artistInfo.artistArtRef.replace('http://', 'https://');
                }
                if(artistInfo.albums){
                    artistInfo.albums.forEach(function(obj){
                        if(obj.albumArtRef){
                            obj.albumArtRef = obj.albumArtRef.replace('http://', 'https://');
                        }
                    });
                }
                if(artistInfo.topTracks){
                    artistInfo.topTracks.forEach(function(obj){
                        if(obj.albumArtRef[0].url){
                            obj.albumArtRef[0].url = obj.albumArtRef[0].url.replace('http://', 'https://');
                        }
                    });
                }

                if(artistInfo.related_artists){
                    artistInfo.related_artists.forEach(function(obj){
                        if(obj.artistArtRef){
                            obj.artistArtRef = obj.artistArtRef.replace('http://', 'https://');
                        }
                    });
                }
                resolve(artistInfo);
            })
        })
    });
};

var albumLookup = function(albumId){
    return new Promise(function(resolve,reject){
        pm.init(creds, function(err){
            if(err){
                console.log(err);
                resolve(null);
            }
            pm.getAlbum(albumId, true, function(err, albumInfo){
                if(err)console.log(err);
                
                albumInfo.albumArtRef = albumInfo.albumArtRef.replace('http://', 'https://');

                if(albumInfo.tracks){
                    albumInfo.tracks.forEach(function(obj){
                        if(obj.albumArtRef[0].url){
                            obj.albumArtRef[0].url = obj.albumArtRef[0].url.replace('http://', 'https://');
                        }
                    })
                }
                resolve(albumInfo);
            });
        });
    });
}

var getStreamUrl = function(storeId){
    return new Promise(function(resolve,reject){
        pm.init(creds,function(err){
            if(err){
                console.log(err);
                resolve(null);
            }
            pm.getStreamUrl(storeId, function(err, streamUrl){
                if(err){
                    console.log(err);
                    resolve(null);
                    return;
                }
                resolve(streamUrl);
            });
        });
    });
}

var getStation = function(stationId){
    return new Promise(function(resolve, reject){
        pm.init(creds, function(err){
            if(err){
                console.log(err);
                resolve(null);
            }
            console.log(stationId);
            pm.getStationTracks(stationId, 10, function(err, result){
                if(err)console.log(err);
                resolve(result);
            });
        });
    });
}

var createStation = function(thingId, type){
    return new Promise(function(resolve,reject){
        pm.init(creds, function(err){
            if(err){
                console.log(err);
                resolve(null);
            }
            pm.createStation('arbitraryName', thingId, type, function(err, result){
                if(err)console.log(err);
                if(result.mutate_response[0].id){
                    getStation(result.mutate_response[0].id).then(function(result2){
                        if(result2.data.stations.length > 0 && 
                        result2.data.stations[0]){
                            result2.data.stations[0].tracks.forEach(function(obj){
                                obj.albumArtRef[0].url = obj.albumArtRef[0].url.replace('http://', 'https://');
                            })
                        }
                        resolve(result2);
                    });
                }
            })
        });
    });
}

function randomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var downloadSong = function(storeId){
    return new Promise(function(resolve, reject){
        var fileName = '/usr/share/nginx/html/audio/' + storeId + ".mp3";
        var file = fs.createWriteStream(fileName);
        getStreamUrl(storeId).then(function(stream){
            if(!stream){
                
                return;
            }
            var request = https.get(stream, function(response){
                response.pipe(file);
                file.on('finish', function(){
                    if(fs.statSync(fileName).size === 0){
                        setTimeout(function(){
                            resolve(null);
                        }, 5000);
                    }else{
                        resolve(storeId);
                    }
                });
            });
        });
    });
}

module.exports = 
{
  search: function (searchTerm) 
  {
     return search(searchTerm)
  },
  artistLookup: function(artistId){
      return artistLookup(artistId)
  },
  albumLookup: function(albumId){
      return albumLookup(albumId);
  },
  downloadSong: function(storeId){
      return downloadSong(storeId);
  },
  createStation: function(thingId, type){
      return createStation(thingId, type);
  },
  getStation: function(stationId){
      return getStation(stationId);
  }
};

