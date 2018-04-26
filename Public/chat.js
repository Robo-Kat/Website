socket = new WebSocket('wss://127.0.0.1:9090/Chatroom/wss');
document.addEventListener('SoftLoad',()=>{
	socket.close();
});
document.ready(()=>{
	var input = document.getElementsByClassName('chat-input')[0];
	var form = document.getElementsByClassName('chat')[0];
	form.addEventListener('submit',()=>{
		socket.send(input.value);
		var message = document.createElement('li');
		message.innerText=input.value;
		document.getElementById('messages').append(message)
		input.value='';
		event.preventDefault();
		return false
	});
	socket.addEventListener('message',(msg)=>{
		var message = document.createElement('li');
		message.innerText=msg.data;
		document.getElementById('messages').append(message)
	});
},{once:true});