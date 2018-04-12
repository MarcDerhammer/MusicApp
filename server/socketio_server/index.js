var app = require('express')();
var https = require('https');
var fs = require( 'fs' );
var downloadInProgress = false;
var stationCreateAttempts = 0;

function tsLog(text){
  var ts = '[' + new Date().toString().substring(0, 24) + '] ';
  console.log(ts + text);
}

writeQueueToFile = function(){
  fs.writeFileSync('/usr/share/nginx/html/queue.json', JSON.stringify(songQueue), 'utf8');
  fs.writeFileSync('/usr/share/nginx/html/queueAA.json', JSON.stringify(aaSongs), 'utf8');
  fs.writeFileSync('/usr/share/nginx/html/AASettings.json', JSON.stringify(aaStation), 'utf8');
}

readFromFile = function(){
  tsLog('attempting read');
  fs.readFile('/usr/share/nginx/html/queue.json', 'utf8', function readFile(err, data){
    if(err){
      tsLog(err);
    }else{
      songQueue = JSON.parse(data);
      downloadInOrder();
    }
  });
  fs.readFile('/usr/share/nginx/html/queueAA.json', 'utf8', function readFile(err, data){
    if(err){
      tsLog(err);
    }else{
      aaSongs = JSON.parse(data);
    }
  });
  fs.readFile('/usr/share/nginx/html/AASettings.json', 'utf8', function readFile(err, data){
    if(err){
      tsLog(err);
    }else{
      aaStation = JSON.parse(data);
    }
  });
}

syncUpUserInfo = function(user){
  songQueue.forEach(function(obj){
    if(obj.user && obj.user.id && obj.user.id == user.id){
      obj.user = user;
    }
  });
}

downloadInOrder = function(){
  if(!downloadInProgress){
    downloadInProgress = true;
    var song = null;
    songQueue.forEach(function(obj){
      if(song == null && !obj.downloaded){
        song = obj;
        return;
      }
    });
    if(song !== null){
      //tsLog('attempting to download ' + song.storeId);
      https.get('https://marcderhammer.com/api/downloadStream/' + song.storeId, function(response){
        response.setEncoding('utf8');
        response.on('data', function(data){
          if(data === song.storeId){
            //tsLog('Download success for ' + song.storeId);
            var wasBotAdd = false;
            songQueue.forEach(function(obj2){
              if(song.storeId === song.storeId){
                //song.downloaded = true;
                wasBotAdd = song.botAdd;
                return;
              }
            });
            
            if(!wasBotAdd){
              //lets move it up in queue.... first
              var from = 0;
              var to = 0;
              for(var i = 0; i < songQueue.length; i++){
                var theSong = songQueue[i];
                if(theSong.storeId === song.storeId){
                  from = i;
                }
              }

              var myLastQueue = 0;
              for(var i = 0; i < songQueue.length; i++){
                var theSong = songQueue[i];
                if(theSong.user && theSong.user.id && theSong.downloaded && song.user && song.user.id && theSong.user.id == song.user.id){
                    myLastQueue = i;                   
                }
              }
              //console.log(song.user.id + ' last queue was ' + myLastQueue);
              to = myLastQueue;
              var usersWhoQueued = [];
              for(var i = myLastQueue; i < songQueue.length; i++){
                var theSong = songQueue[i];
                if(!theSong.user){
                  if(to > 0)
                    to = i-1;
                  i = songQueue.length;
                }
                if(theSong.user && theSong.user.id && theSong.downloaded){
                  if(!usersWhoQueued.includes(theSong.user.id)){
                    usersWhoQueued.push(theSong.user.id);
                    to++;
                  }else{
                    //Found first repeat!
                    if(to > 0)
                      to = i-1;
                    console.log('set to ' + to);
                    i = songQueue.length;
                  }
                }
              }

              if(to+1 <= songQueue.length){
                to++;
                songQueue.splice(to, 0, songQueue.splice(from, 1)[0]);
              }
            }

            song.downloaded = true;
            downloadInProgress = false;
            downloadInOrder();
            writeQueueToFile();
            io.emit('songQueue', songQueue);
            
            return;
          }else{
            for(var i = 0; i < songQueue.length; i++){
              if(songQueue[i].storeId === song.storeId){
                songQueue.splice(i, 1);
                writeQueueToFile();
                tsLog('download FAILED for ' + song.storeId);
                downloadInProgress = false;
                io.emit('songQueue', songQueue);
                if(i ==0){
                  io.emit('playNextSong', 'yea');
                }
                downloadInOrder();
                break;
              }
            }
          }
        });
      });
    }else{
      //tsLog('Downloads must be complete!');
      downloadInProgress = false;
    }
  }
}

var server = https.createServer({
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./cert.pem'),
  ca: fs.readFileSync('./fullchain.pem'),
  requestCert: false,
  rejectUnauthorized: false
},app);

var io = require('socket.io')(server);

var users = [];
var songQueue = [];
var aaStation = {};
var aaSongs = [];
readFromFile();
var currentSong = {};
var masterProg = {};
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  if(socket.request.connection.remoteAddress){
    tsLog('Someone connected: ' + socket.request.connection.remoteAddress);
  }else{
    tsLog('Someone connected but I don\'t know their IP');
  }

  function createStationAndAddSongs(data){
    stationCreateAttempts++;
    https.get('https://marcderhammer.com/api/createStation/' + data.id + '/' + data.type, function(response){
      var body = '';
      response.on('data', function(chunk){
          body += chunk;
      });

      response.on('end', function(){
        var failed= false;
        var dat = {};
        try{
          dat = JSON.parse(body);
        }catch(err){
          failed = true;
          console.log(err);
        }
        if(failed){
          return;
        }

        var tracks = dat.data.stations[0].tracks;
        tracks.forEach(function(newTrack){
          newTrack.botAdd = true;
          var alreadyExists = false;
          aaSongs.forEach(function(aaSong){
            if(newTrack.storeId === aaSong.storeId){
              alreadyExists = true;
              return;
            }
          });
          if(!alreadyExists){
            songQueue.forEach(function(sque){
              if(sque.storeId === newTrack.storeId){
                alreadyExists = true;
                return;
              }
            });
          }
          if(!alreadyExists){
            aaSongs.push(newTrack);
            stationCreateAttempts = 0;
          }
        });
        tsLog(aaSongs.length);
        botAddSongToQueue();
      });
    });
  }

  socket.on('setAA', function(data){
    tsLog('new AA set: ' + data);
    if(aaStation.id !== data.id || aaStation.type !== data.type){
      aaSongs = [];
    }
    aaStation.name = data.name;
    aaStation = data;
    writeQueueToFile();
    createStationAndAddSongs(aaStation);
  });

  socket.on('joinAudio', function(){
    tsLog('someone joined audio');
    socket.listening = true;
    var masterExists = false;
    for (var i in io.sockets.connected) {
      var s = io.sockets.connected[i];
      
      if(s.master){
        masterExists = true;
        break;
      }
    }
    if(!masterExists){
      socket.master = true;
      socket.emit("newMaster", true);
      tsLog("There was no master so this is now the master");
    }
    socket.emit("master", socket.master == true);
  });

  socket.on('leaveAudio', function(){
    tsLog('someone is leaving audio');
    socket.listening = false;
    socket.master = false;

    var masterExists = false;
    for (var i in io.sockets.connected) {
      var s = io.sockets.connected[i];
      if(s.master){
        masterExists = true;
        break;
      }
    }

    if(!masterExists){
      for (var i in io.sockets.connected) {
        var s = io.sockets.connected[i];
        if(s.listening){
          s.master=true;
          s.emit("newMaster", true);
          tsLog('new master selected');
          return;
        }
      }
    }
  });

  socket.on('removeFromQueue', function(id){
    if(socket.master){
      for(var i = 0; i < songQueue.length; i++){
        if(songQueue[i].storeId === id){
          songQueue.splice(i, 1);
          botAddSongToQueue();
          writeQueueToFile();
          io.emit('songQueue', songQueue);
          if(i ==0){
            io.emit('playNextSong', 'yea');
          }
          break;
        }
      }
    }
  });

  socket.on('masterSetProg', function(data){
    if(songQueue[0]){
      var now = Date.now();

      var songDuration = songQueue[0].durationMillis/1000; 
      var percentage = data;
      var setToTimeInSeconds = songDuration*(1-(1-percentage));
      var prog = {
        seconds: setToTimeInSeconds,
        percentage: data*100,
        time: Date.now(),
        id: socket.id,
        count: 0
      }

      masterProg = prog;

      io.emit('songProgChange', prog);

  }
  });

  socket.on('disconnect', function(){
    if(socket.request.connection.remoteAddress){
      tsLog('Someone disconnected: ' + socket.request.connection.remoteAddress);
    }else{
      tsLog('Someone disconnected but I don\'t know their IP');
    }
    socket.listening = false;
    socket.master = false;

    var masterExists = false;
    for (var i in io.sockets.connected) {
      var s = io.sockets.connected[i];
      if(s.master){
        masterExists = true;
        break;
      }
    }

    if(!masterExists){
      for (var i in io.sockets.connected) {
        var s = io.sockets.connected[i];
        if(s.listening){
          s.master=true;
          s.emit("newMaster", true);
          tsLog('new master selected');
          return;
        }
      }
    }
    
  });

  socket.emit('songQueue', songQueue);

  socket.on('getSongQueue', function(msg){
    socket.emit('songQueue', songQueue);
  });

  socket.on('upvote', function(song){
	return;
    songQueue.forEach(function(obj){
      if(obj.storeId === song.storeId){
        if(!obj.score){
          obj.score = 0;
        }
        obj.score++;
        return;
      }
      io.emit('songQueue', songQueue);
  //    writeQueueToFile();
    })
  });

  socket.on('downvote', function(song){
	return;
    songQueue.forEach(function(obj){
      if(obj.storeId === song.storeId){
        if(!obj.score){
          obj.score = 0;
        }
        obj.score--;
        return;
      }
      io.emit('songQueue', songQueue);
//      writeQueueToFile();
    })
  });

  socket.on('songProgUpdate', function(msg){
    io.emit('songProg', msg);
  });

  function countBotSongs(){
    var botSongs = 0;
    songQueue.forEach(function(obj){
      if(obj.botAdd){
        botSongs++;
      }
    });
    
    return botSongs;
  }

  function botAddSongToQueue(){
    var botSongs = countBotSongs();
    if(botSongs < 5){
      var oneWasAdded = false;
      aaSongs.forEach(function(aasong){
        if(!oneWasAdded){
          aasong.botAdd = true;
          
          if(!aasong.added){
            var queued = false;
            songQueue.forEach(function(obj){
              if(obj.storeId === aasong.storeId){
                queued = true;
                return;
              }
            });
            if(!queued){
              songQueue.push(aasong);
              aasong.added = true;
              io.emit('songQueue', songQueue);
              downloadInOrder();
              writeQueueToFile();
              oneWasAdded = true;
              return;
            }
          }
        }
      });
      if(!oneWasAdded){
        if(stationCreateAttempts < 15){
          tsLog('station was exhausted.. making a new one!');
          createStationAndAddSongs(aaStation);
          }else{
            tsLog('you must have listened to all the possible station songs.. i cant get any new ones.. or somethings broken');
          }
      }else{
        botAddSongToQueue()
      }
    }
  };

  socket.on('addSongToQueue', function(msg){
    tsLog('song received');
    var alreadyQueued= false;
    if(msg.user){
      syncUpUserInfo(msg.user);
    }
    songQueue.forEach(function(obj){
      if(obj.storeId === msg.storeId){
        alreadyQueued = true;
      }
    });
    if(!alreadyQueued){
      msg.downloaded = false;
      songQueue.push(msg);
      socket.emit('queueSuccess', msg.storeId);
      socket.emit('toastMessage', 'Song Queued!');
      io.emit('songQueue', songQueue);
      writeQueueToFile();
      downloadInOrder();
    }else{
      var message = {
        primary: "Already Queued",
        secondary: "That song is already in the queue."
      }
      socket.emit('alertMessage', message);
    }
  });

  socket.on('chat', function(msg){
    io.emit('chatBroad', msg);
  });

  socket.on('songReport', function(data){
    if(songQueue[0]){
      var now = Date.now();
      socket.lastReport = {
        time: now,
        prog: data.prog
      }
      
      if(socket.master){
        var percentage = (data.prog * 1000)/songQueue[0].durationMillis;
        percentage *= 100;
        var prog = {
          seconds: data.prog,
          percentage: percentage,
          time: now,
          id: socket.id
        }

        //botAddSongToQueue();

        var count = 0;
        for (var i in io.sockets.connected) {
          var s = io.sockets.connected[i];
          if(s.listening){
            count++;
          }
        }
        masterProg = prog;
        prog.count = count;
        if(aaStation && aaStation.name){
          prog.aa = aaStation.name;
        }
        io.emit('songProg', prog);
      }else{
        var masterExists = false;
        for (var i in io.sockets.connected) {
          var s = io.sockets.connected[i];
          if(s.master){
            masterExists = true;
            break;
          }
        }
    
        if(!masterExists && socket.listening){
          socket.master = true;
          tsLog('a master has been chosen');
          socket.emit("newMaster", true);
          var percentage = (data.prog * 1000)/songQueue[0].durationMillis;
          percentage *= 100;
          var prog = {
            seconds: data.prog,
            percentage: percentage,
            time: now,
            id: socket.id
          }
          masterProg = prog;
          io.emit('songProg', prog);

          masterProg = prog;
        }else{
          if(!masterProg || !masterProg.time || now - masterProg.time > 10000){
            tsLog("'master' is too far behind... clearing masters");
            for (var i in io.sockets.connected) {
              var s = io.sockets.connected[i];
              s.master = false;
            }
            socket.master = true;
            socket.listening = true;
            socket.emit("newMaster", true);
          }
        }
      }
  }
  });

  socket.on('songEnded', function(data){
    if(socket.master){
      songQueue.shift();
      botAddSongToQueue();
      io.emit('songQueue', songQueue);
      io.emit('playNextSong', 'yea');
      writeQueueToFile();
    }
  });

  socket.on('pinger', function(msg){
    socket.emit('pingback', 'whatup');
  });

  socket.on('userInfoChanged', function(msg){
    syncUpUserInfo(msg);
    io.emit('userOnly', msg);
  });
});

server.listen(3001, function(){
  tsLog('listening on *:3001');
});
