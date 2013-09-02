
var textArea = document.getElementById('textArea');
var input = document.getElementById('input');

var socket = null;

var sendAsUser = function(msg) {
	textArea.innerHTML += "<div class=\"rightAligned\"><label>"+msg+"</label></div><br>";
};

var sendAsServer = function(msg) {
	textArea.innerHTML += "<div class=\"leftAligned\"><label>"+msg+"</label></div><br>";
};

var onInputKeyPressed = function(event){
	if(window.event) // IE
		keynum = event.keyCode
	else if(event.which) // Netscape/Firefox/Opera
		keynum = event.which
	if(keynum == 13){
		if(!input.value)
			return;
		socket.emit('msg',input.value);
		sendAsUser(input.value);
		input.value = '';
	}

};

(function(){
	input.onkeypress = onInputKeyPressed;

	socket = io.connect('/');

	socket.on('hello', function(data) {
		sendAsServer(data);
		socket.emit('echo', null);
	});

	socket.on('msg', function(data) {
		if(data.msg == 'clr'){
			textArea.innerHTML = "";
			return;
		}
		sendAsServer(data.pre+data.msg);
	});

})();