var app = require('http').createServer(handler), 
    io = require('socket.io').listen(app), 
    fs = require('fs'),
    peers = [],
    peerSDPs = [];

app.listen(8001);

function handler (req, res) {
  fs.readFile(__dirname + '/peer.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading socketio_client.html');
    }

    res.writeHead(200,{'Content-Type' : 'text/html'});
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  
  console.log('peer connected');
  
  if(peers.length == 0){ // no other peer has connected so far
    socket.emit('client_socket', '0'); 
    peers.push(socket);
  }
  else if(peers.length == 1){ // a second peer has connected now a webrtc-connection can be established
    peers.push(socket);
    socket.emit('client_socket', peerSDPs[0]); 
  }

  
  //console.log(socket);
  
  socket.on('server_socket', function (data) {
    
    if(peers.length < 3)
      peerSDPs.push(data);
      
    socket.broadcast.emit('client_socket', data);
    
  });
  
  socket.on('disconnect', function () {
    console.log('hier');
    peers = [];
    peerSDPs = [];
    
    var sockets = io.sockets.clients();
    for(var s=0; s < sockets.length; s++)
      if(sockets[s])
        sockets[s].emit('client_socket', 'reset'); 
  
  });
  
});