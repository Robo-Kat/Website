

class NN {
	constructor(...args) {
		this.args = args;
		this.layers = [{length:args[0]}];
		function rand() {return (Math.random()-0.5)}
		for (var i = 1; i < args.length; i++) {
			this.layers[i] = [...Array(args[i])].map(()=>{return {bias:rand(),weights:[...Array(args[i-1])].map(()=>rand())}})
		}
	}
	getState() {
		arr = [...Array(this.args.length)]
		arr[0] = {length:this.args[0]}
		for (var i = 1; i < this.args.length; i++) {
			arr[i] = [...Array(this.args[i])]
			for (var j = 0; j < this.args[i]; j++) {
				arr[i][j] = {bias:this.layers[i][j].bias,weights:this.layers[i][j].weights.slice()}
			}
		}
		return arr;
	}
	guess(data) {
		var arr = [];
		for (var i = 0; i < this.args.length; i++) {
			arr[i] = [...Array(this.args[i])];
		}
		arr[0] = data;
		for (var i = 1; i < arr.length; i++) {
			for (var j = 0; j < arr[i].length; j++) {
				arr[i][j] = this.layers[i][j].bias;
				for (var k = 0; k <this.layers[i-1].length; k++) {
					arr[i][j] += arr[i-1][k] * this.layers[i][j].weights[k];
				}
				arr[i][j] = 1/(1 + Math.exp(-arr[i][j]));
			}
		}
		return arr[arr.length-1];//data
	}
	train(data,state,cost,label) {
		δA = [...Array(state.length)];
		for (var i = 1; i <state.length; i++) {
			δA[i] = [...Array(state[i].length)].map(k=>0);
		}
		for (var j = 0; j < state[i].length; j++) {
			δA[i][j] = cost * (data[i][j] - (this.label == j));
		}


		for (var i = state.length - 1; i >= 0; i--) {
			for (var j = 0; j < state[i].length; j++) {
				δA[i][j] *= this.value * (1 - this.value);
				this.layers[i][j].bias += δA[i][j];
				for (var k = 0; k < state[i-1].length; k++) {
					δA[i-1][k] += δA[i][j] * state[i][j].weights[k];
					this.layers[i][j].weights[k] += δA[i][j] * data[i-1][k]
				}
			}
		}
	}
}

class Mete {
	constructor(args) {
		this.NN = new NN(args);
		this.instances = [];
		this.state;
	}
	Guess(data,label) {
		if (this.state === undefined) {
			this.state = this.NN.getState();
		}
		this.instances.push({label,data:this.NN.guess(data)});
	}
	Train(sensitivity) {
		var cost = 0;
		for (var instance of this.instances) {
			var neurons = instance.data[instance.data.length-1]
			for (var i = 0; i < neurons.length; i++) {
				cost += (neurons[i] - (instance.label == i))**2
			}
		}
		cost*=sensitivity;
		cost/=this.instances.length;
		for (var instance of this.instances) {
			this.NN.train(instance.data,this.state,cost,instance.label);
		}
		this.instances = [];
		this.state = undefined;
		return cost;
	}
}

NN = new Mete(748,256,256,10);



/*


class BaseNeuron {
	constructor() {
		this.value = 0;
	}
}

class Neuron extends BaseNeuron {
	constructor(n) {
		super();
		this.bias = Math.random()-0.5;
		this.weights = [...Array(n)].map(() => Math.random()-0.5);
		this.δA = 0;
	}
	σ() {
		this.value = 1/(1 + Math.exp(-this.value));
	}
}

class Layer {
	constructor(length,prevLayer) {
		this.prevLayer = prevLayer;
		this.length = length;
		this.neurons = [...Array(length)].map(()=>prevLayer == undefined ? new BaseNeuron() : new Neuron(prevLayer.length));
	}
	propogate() {
		for (var i = 0; i < this.length; i++) {
			this.neurons[i].value = this.neurons[i].bias;
			for (var j = 0; j <this.prevLayer.length; j++) {
				this.neurons[i].value += this.prevLayer.neurons[j].value * this.neurons[i].weights[j];
			}
			this.neurons[i].σ();
		}
	}
	Rpropogate() {
		for (var i = 0; i < this.length; i++) {
			this.δA *= this.value * (1 - this.value);
			for (var j = 0; j < this.prevLayer.length; j++) {
				this.prevLayer.neurons[j].δA += this.δA * this.neurons[i].weights[j];
				this.neurons[i].weights[j] += this.δA * this.prevLayer.neurons[j].value;
			}
		}
	}
}

class NNinstance {
	constructor(...args) {
		this.layers = [];
		var prevLayer = undefined;
		for (var arg of args) {
			if (typeof arg != 'number') throw new Error("Invalid argument: must be a number");
			var thisLayer = new Layer(arg,prevLayer);
			this.layers.push(thisLayer);
			prevLayer = thisLayer;
		}
	}
	propogate(data,label) {
		this.label = label;
		if (data.length != this.layers[0].length) throw new Error("data array must be same size of first layer on neurons");
		for (var datum of data) {
			this.layers[0].value = datum;
		}
		for (var i = 1; i < this.layers.length; i++) {
			this.layers[i].propogate();
		}
	}
	Rpropogate(cost) {
		var LastLayer = this.layers[this.layers.length-1];
		for (var i = 0; i < LastLayer.length; i++) {
			LastLayer.neurons[i].δA = cost * (LastLayer.neurons[i].value - (this.label == i));
		}//init last layer δA's

		

		for (var i = this.layers.length-1; i > 0; i--) {
			//this.layers[i].Rpropogate(cost);
		}
	}
	guess() {
		var acc = 0;
		var ret;
		var neurons = this.layers[this.layers.length-1].neurons;
		for (var i = 0; i < neurons.length; i++) {
			if (neurons[i].value > acc) {
				acc = neurons[i].value;
				ret = i;
			}
		}
		return ret;
	}
	cost() {
		var acc = 0;
		var neurons = this.layers[this.layers.length-1].neurons
		for (var i = 0; i < neurons.length; i++) {
			acc += (neurons[i].value - (this.label == i))**2
		}
		return acc;
	}
}


class NN {
	constructor(...args) {
		this.args = args;
		this.instances = [];
	}
	Guess(data,label) {
		var instance;
		this.instances.push(instance = new NNinstance(...this.args));
		instance.propogate(data,label);
		return instance.guess();
	}
	Train(sensitivity) {
		var cost = 0;
		for (var instance of this.instances) {
			cost += instance.cost();
		}
		cost*=sensitivity;
		cost/=this.instances.length;
		for (var instance of this.instances) {
			instance.Rpropogate(cost);
		}
		this.instances = [];
		return cost;
	}
}






NN = new NN(784,256,256,10)

*/