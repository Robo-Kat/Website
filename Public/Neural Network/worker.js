class NNBase {
	loadNN(data,struct) {
		this.struct = struct;
		this.layers = data;
	}
	getState() {
		var arr = [...Array(this.struct.length)]
		arr[0] = {length:this.struct[0]}
		for (var i = 1; i < this.struct.length; i++) {
			arr[i] = [...Array(this.struct[i])]
			for (var j = 0; j < this.struct[i]; j++) {
				arr[i][j] = {bias:this.layers[i][j].bias,weights:this.layers[i][j].weights.slice()}
			}
		}
		return arr;
	}
	guess(data) {
		var arr = [];
		for (var i = 0; i < this.struct.length; i++) {
			arr[i] = [...Array(this.struct[i])];
		}
		arr[0] = data;
		for (var i = 1; i < arr.length; i++) {
			for (var j = 0; j < arr[i].length; j++) {
				arr[i][j] = this.layers[i][j].bias;
				for (var k = 0; k <this.layers[i-1].length; k++) {
					arr[i][j] += arr[i-1][k] * this.layers[i][j].weights[k];
				}
				//if (i==this.struct.length-1) //sigmoid output layer
					arr[i][j] = 1/(1 + Math.exp(-arr[i][j]));
			}
		}
		return arr;//data
	}
	train(data,state,cost,label) {
		var δA = [...Array(state.length)];
		for (var i = 1; i <state.length; i++) {
			δA[i] = [...Array(state[i].length)].map(k=>0);
		}
		i--;
		for (var j = 0; j < state[i].length; j++) {
			δA[i][j] = cost * (data[i][j] - (label == j));
		}


		for (; i > 0; i--) {
			for (var j = 0; j < state[i].length; j++) {
				//if (i==this.struct.length-1) //inv sigmoid output layer
					δA[i][j] *= data[i][j] * (1 - data[i][j]);
				this.layers[i][j].bias += δA[i][j];
				for (var k = 0; k < state[i-1].length; k++) {
					(i-1) && (δA[i-1][k] += δA[i][j] * state[i][j].weights[k]);
					this.layers[i][j].weights[k] += δA[i][j] * data[i-1][k]
				}
			}
		}
	}
}

class NN {
	constructor(...args) {
		this.NN = new NNBase();
		this.instances = [];
		this.state;
	}
	newNN(...args) {
		var struct = args;
		var layers = [{length:args[0]}];
		function rand() {return (Math.random()-0.5)}
		for (var i = 1; i < args.length; i++) {
			layers[i] = [...Array(args[i])].map(()=>{return {bias:rand(),weights:[...Array(args[i-1])].map(()=>rand())}})
		}
		this.NN.loadNN(layers,struct)
	}
	loadNN(layers,struct,id) {
		this.id = id;
		this.state = undefined;
		this.instances = [];
		this.NN.loadNN(layers,struct)
	}
	Guess(data,label) {
		if (this.state === undefined) {
			this.state = this.NN.getState();
		}
		data = this.NN.guess(data);
		if (label) this.instances.push({label,data});

		var acc = 0, ret, neurons = data[data.length-1];
		for (var i = 0; i < neurons.length; i++) {
			if (neurons[i] > acc) {
				acc = neurons[i];
				ret = i;
			}
		}
		return [ret,acc];
	}
	Train(sensitivity) {
		var cost = 0;
		for (var instance of this.instances) {
			var neurons = instance.data[instance.data.length-1]
			for (var i = 0; i < neurons.length; i++) {
				cost += (neurons[i] - (instance.label == i))**2
			}
		}
		cost/=this.instances.length;
		cost*=Math.abs(cost);
		cost*=-sensitivity;
		for (var instance of this.instances) {
			this.NN.train(instance.data,this.state,cost,instance.label);
		}
		this.instances = [];
		this.state = undefined;
		return -cost/sensitivity;
	}
}

class DataStream {
	constructor() {
		this.data = [];
		this.target = 10;
		this.timeout;
	}
	read() {
		for (var i = 0; i <= this.target - this.data.length; i++) {
			let p = new Promise((res,rej)=>{
				getData((data)=>{
					res(data);
				});
			}).then((value)=>{
				p.done = true;
				return value;
			});
			this.data.push(p)
		}
		for (var i = 0; i < this.data.length; i++) {
			if (this.data[i].done) {
				return this.data.splice(i,1)[0];
			}
		}
		if (!this.timeout) {
			this.timeout = true;
			this.target++;
			setTimeout(()=>{
				this.timeout = false;
			},50)
		}
		return this.data.splice(0,1)[0];
	}
}

NN = new NN();
NN.newNN(748,676,576,484,400,10);

/////////////////////////stuff//////////////////

function render(label,data,x,y) {
	buffer = new Uint8ClampedArray(x*y*4);
	for (var i = 0; i < x*y; i++) {
		buffer.set([data[i],data[i],data[i],255],i*4)
	}
	postMessage({cmd:'img',label,img:new ImageData(buffer,x,y)});
}

function getData(cb,i) {
	var xhttp = new XMLHttpRequest();
	xhttp.responseType = "arraybuffer";
	xhttp.onreadystatechange = function(){
		if(this.readyState==4&&this.status==200) {
			var [x,y,label,...data] = new Uint8Array(this.response);
			cb({label,data,x,y});
		}
	}
	xhttp.open('GET',`/Neural Network/data${i&&`?i=${i}`||''}`);
	xhttp.send();
}

var db;
var req = indexedDB.open('NNDB',1);
req.onupgradeneeded = (event)=>{
	db = event.target.result;
	var objectStore = db.createObjectStore("NeuralNets", { keyPath: "id", autoIncrement : true });
	objectStore.createIndex("struct", "struct", { unique: false });
	//objectStore.createIndex("name", "name", { unique: false });
};
req.onsuccess = (event)=>{
	db = event.target.result;
	db.onerror = console.log;
};

function save() {
	data = {state:NN.NN.getState(),struct:NN.NN.struct};
	if (NN.id) data.id = NN.id
	var req = db.transaction(["NeuralNets"], "readwrite").objectStore('NeuralNets').put(data);
	if (!NN.id) {
		req.onsuccess = function(event) {
			NN.id = event.target.result;
		}
	}
}

function load(id) {
	var req = db.transaction(["NeuralNets"], "readwrite").objectStore('NeuralNets').get(id);
	req.onsuccess = (event)=>{
		NN.loadNN(req.result.state,req.result.struct,id);
	};
}




//0412336142







//window.onbeforeunload = ()=>{if (NN.id) save;};

dataStream = new DataStream();
var Training = false;

this.addEventListener('message',(msg)=>{
	Training = false;
	if (msg.data.cmd==="Guess") {
		dataStream.read().then(({label,data,x,y})=>{
			render(label,data,x,y);
			postMessage({cmd:'out',guess:NN.Guess(data,label)});
		});
	}
	else if (msg.data.cmd==='StartTraining') {
		Training = true;
		train();
	}
	else if (msg.data.cmd==='StopTraining') {
	}
	else if (msg.data.cmd==='Data') {
		postMessage({cmd:'out',guess:NN.Guess(msg.data.data)});
	}
});

s = 1;

function train() {
	if (!Training) return;
	dataStream.read().then(({label,data,x,y})=>{
		render(label,data,x,y);
		postMessage({cmd:'out',guess:NN.Guess(data,label)});
		//NN.Guess(data,label);
		if (NN.instances.length >= 60)
			postMessage({cmd:'cost',cost:NN.Train(0.00000001/s++)});
	});
	setTimeout(train,0);
}	