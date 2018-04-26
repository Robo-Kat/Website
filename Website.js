const fs = require('fs');
const options = {
  	key: fs.readFileSync('PrivateKey.txt'),
  	cert: fs.readFileSync('Certificate.crt')
  	,allowHTTP1:true
};
const pug = require('pug');

const router = require('./other/router.js')();
const Dependents = require('./Dependents.json');
const WebSocket = require('ws');

const http2 = require('http2');
const server = http2.createSecureServer(options);
server.on('stream', router);
const wss = new WebSocket.Server({ server });

wss.on('connection',(ws,req)=>{
	req = {':path':req.url,':method':'WSS'};
	router(ws,req);
});

const router2 = require('./router/NN.js');

router.use(/^\/Neural Network\//,router2);

router.route(/^\/?$/,'GET',(stream,req,)=>{
	stream.respond({status:200,'Content-Type':'text/html'});
	Dependents['home.html'].forEach(k=>{
		stream.pushStream({':path':`/${k}`},router);
	});
	stream.end(pug.renderFile('./public/home.pug'));
});

router.route(/^\/([^\/^\.]+)\.html$/,'GET',(stream,req)=>{
	(a = Dependents[`${req.params[0]}.html`]) && a.forEach(k=>{
		stream.pushStream({':path':`/${k}`},router);
	});
	stream.end(pug.renderFile(`./public/${req.params[0]}.pug`));
});

router.route(/^(.(?!\.\.\/))*\.(css|js|png)$/,'GET',(stream,req)=>{
	var Headers = {
		'Content-Type': ({css:'text/css',js:'application/javascript',png:'image/png'})[req.params[1]]
	}
	stream.respondWithFile(`./public${req.url}`,Headers,{onError:console.log});
});


chatSockets = [];

router.route(/^\/Chatroom\/wss$/,'WSS',(ws,req)=>{
	chatSockets.push(ws);
	ws.on('close',()=>{
		chatSockets.splice(chatSockets.indexOf(ws),1);
	});
	ws.on('message',(msg)=>{
		for (sock of chatSockets) {
			if (sock != ws) {
				sock.send(msg);
			}
		}
	});
})


router.route(/.*/,'GET',(stream,req)=>{
	console.log(req.url);
	stream.respond({':status':404,'Content-Type':'text/html'});
	Dependents['index.html'].forEach(k=>{
		stream.pushStream({':path':`/${k}`},router);
	});
	stream.end(pug.renderFile('./public/index.pug'));
})

router.route(/.*/,'all',(stream,req)=>{
	console.log(req.url);
	if (stream.state) {
		stream.respond({':status':404,'Content-Type':'text/plain'})
		stream.end('404 Page Not Found')
	}
});

// data = JSON.parse(`{${data.toString().replace(/(\w+)=(\w+)(&?)/g,(_,p1,p2,p3)=>`"${p1}":"${p2}"${p3&&','}`)}}`);

server.listen(9090);


