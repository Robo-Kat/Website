const fs = require('fs');

class Data {
	constructor() {
		var testdata = false;
		this.LabelFile = fs.openSync("./Neural Network/TrainingData/" + (testdata?"t10k-labels.idx1-ubyte":"train-labels.idx1-ubyte"),'r');
		this.ImageFile = fs.openSync("./Neural Network/TrainingData/" + (testdata?"t10k-images.idx3-ubyte":"train-images.idx3-ubyte"),'r');
		this.length = testdata?5000:60000;
		this.x = 28;
		this.y = 28;
	}
	getData(i,callback) {
		i = i === undefined ? Math.random()*this.length : i;
		i = parseInt(i); //for some reason necessary
		Promise.all([
			new Promise((res,rej)=>{
				var image = new Uint8Array(784);
				fs.read(this.ImageFile,image,0,28*28,16+28*28*i,()=>{res(image);});
			}),
			new Promise((res,rej)=>{
				var label = new Uint8Array(1);
				fs.read(this.LabelFile,label,0,1,8+i,(e,a,b)=>{res(label);});
			})
		]).then((w)=>{callback(w[0],w[1])});
	}
}


module.exports = new Data();