const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {

	// Keep track of http requests
  let numReqs = 0;
	setInterval(() => {
		console.log(`numReqs = ${numReqs}`);
	}, 1000);

	// Count requests
	function messageHandler(msg) {
    console.log(arguments);
		if (msg.cmd && msg.cmd === 'notifyRequest') {
			numReqs += 1;
		}
	}

  cluster.settings.exec = "C:\\Users\\Lachlan\\Documents\\Website\\Router\\test.js"
	// Start workers and listen for messages containing notifyRequest
	const numCPUs = require('os').cpus().length;
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();

	}

	for (const id in cluster.workers) {
		cluster.workers[id].on('message', messageHandler);
    cluster.workers[id].on('online',()=>{console.log(`${id} online`)})
    setTimeout(()=>{
      cluster.workers[id].send({cmd:'test'})
    },2000)
	}

} else {
  process.on('message',(msg)=>{console.log(msg)});
  for (var i = 0; i<10**10; i++) i*=1;
	process.send({ cmd: 'notifyRequest' });
}