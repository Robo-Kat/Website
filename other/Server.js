var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pug = require('pug');
var net = require('net');
var fs = require('fs');



net.createServer(c=>{
    var chunks = []
    var total = 0
    c.on('data',(chunk)=>{chunks.push(chunk); total += chunk.length; console.log(total); });
    c.on('end',()=>{
        fs.writeFileSync('Anthology VI.mp4',Buffer.concat(chunks));
        console.log('done');
    });
}).listen(8080);





// app.get('/', function(req, res){
//   var file = fs.createWriteStream('./anthology VI');
//   req.on('data',(chunk)=>{file.write(chunk)})
//   req.end
// });

// io.on('connection', function(socket){
// 	console.log('a user connected');
// 	socket.on('disconnect', function(){
//     	console.log('user disconnected');
//     });
//     socket.on('chat message', function(msg){
//     	console.log('message: ' + msg);
//     });
// });


// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });
// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });