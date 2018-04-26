const http = require('http');
const fs = require('fs');
const net = require('net');


// var req = http.get('http://192.168.1.116:1337',(res)=>{
// 	res.pipe(process.stdout);
// });


var sock = net.connect(1337,"192.168.1.116",()=>{console.log("connected")});
sock.on('data',(chunk)=>{process.stdout.write(chunk);});


