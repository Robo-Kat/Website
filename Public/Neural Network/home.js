w = new Worker("./worker.js");

document.ready(()=>{
	var first = 5;
	var canvas = document.getElementById('dataBMP');
	canvas.height = canvas.width = 28;
	var ctx = canvas.getContext('2d');
	var canvasCleared = false;


	(function () {
		var style = 'white';
		var thickness = 2/7;


		var drawing = false;
		var cX = cY = pX = pY = 0;

		canvas.addEventListener('mouseup',(e)=>{drawing = false;});
		canvas.addEventListener('mouseout',(e)=>{drawing = false;});
		canvas.addEventListener('mousedown',(e)=>{drawing = true;
			if (!canvasCleared) {
				ctx.clearRect(0,0,canvas.width,canvas.height);
				canvasCleared = true;
			}
			var {left,top} = canvas.getBoundingClientRect();
			cX = (e.clientX - left)/36;
			cY = (e.clientY - top)/36;
			ctx.fillStyle = style;
			ctx.fillRect(cX-thickness/2, cY-thickness/2, thickness, thickness);
			
		});
		canvas.addEventListener('mousemove',(e)=>{
			if (drawing) {
				var {left,top} = canvas.getBoundingClientRect();
				pX = cX;
				pY = cY;
				cX = (e.clientX - left)/36;
				cY = (e.clientY - top)/36;
				ctx.beginPath();
				ctx.moveTo(pX, pY);
				ctx.lineTo(cX, cY);
				ctx.strokeStyle = style;
				ctx.lineWidth = thickness;
				ctx.stroke();
				ctx.closePath();
			}
		});
	})();
		

	var costChart = document.getElementById('costchart').getContext('2d');
	costChart = new Chart(costChart, {
		type: 'line',
		data: {
			labels: [],
			datasets: [{
				label:"Cost",
				fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
				borderColor: 'rgb(255, 99, 132)',
				data: []
			}]
		},
		options:{
			responsive:false,
			elements: {
				line: {
					tension: 0, // disables bezier curves
				}
			}
		}
	});
	
	var trainButton = document.getElementById('NNTrain')
	function StartTraining() {
		w.postMessage({cmd:'StartTraining'});
		trainButton.innerText = 'Stop Training ';
		trainButton.removeEventListener('click',StartTraining);
		trainButton.addEventListener('click',StopTraining);
		canvasCleared = false;
	}
	function StopTraining() {
		w.postMessage({cmd:'StopTraining'});
		trainButton.innerText = 'Start Training';
		trainButton.removeEventListener('click',StopTraining);
		trainButton.addEventListener('click',StartTraining);
	}
	trainButton.addEventListener('click',StartTraining);
	document.getElementById('NNGuess').addEventListener('click',()=>{
		w.postMessage({cmd:'Guess'})
		canvasCleared = false;
		StopTraining();	
	});
	document.getElementById('NNInput').addEventListener('click',()=>{
		var data = [],rawdata = ctx.getImageData(0,0,canvas.width,canvas.height);
		for (var i = 0; i<rawdata.data.length/4;i++) {
			data[i] = rawdata.data[4*i];
		}
		w.postMessage({cmd:'Data',data:data});
		canvasCleared = false;
		StopTraining()
	});



	var labelElement = document.getElementsByClassName('label')[0];
	var guessElement = document.getElementsByClassName('guess')[0];
	var probElement = document.getElementsByClassName('prob')[0];
	w.addEventListener('message',(msg)=>{
		if (msg.data.cmd==='img') {
			ctx.scale(5,5);
			ctx.putImageData(msg.data.img,0,0);
			labelElement.innerText = msg.data.label;
			guessElement.innerText = '';
		}
		else if (msg.data.cmd==='out') {
			guessElement.innerText = msg.data.guess[0];
			probElement.innerText = (msg.data.guess[1]*100).toFixed(1)+'%';
		}
		else if (msg.data.cmd==='cost') {
			//if (first) {first--; return;}
			costChart.data.labels.push(costChart.data.labels.length);
			costChart.data.datasets[0].data.push(msg.data.cost);
			costChart.update();
		}
	});



	w.postMessage({cmd:'Guess'})
});