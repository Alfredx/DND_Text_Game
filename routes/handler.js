
var log = function(content) {
	var date = new Date();
	date = date.toLocaleTimeString();
	console.log('['+date+"]\n"+content);
};

//used in dev
var initSocket = function(socket){
	socket.emit('hello', 'hello this is server! let\'s play!');
	socket.on('echo', function(data){
		log('socket now is set up');
	});

	socket.on('msg', function(data){
		log('[user]: '+data);
		socket.emit('msg', 'echo msg');
	});
};

exports.index = function(req, res) {
	var context = {
		title : "Coming soon..."
	};
	res.render('index',context);
};

//for development use
exports.dev = function(req, res) {
	var context = {
		title : "For Development"
	};
	res.render('dev_index',context);
};

exports.initIO = function(io) {
	io.sockets.on('connection', function(socket) {
        initSocket(socket);
    });
};

exports.msgHandle = function(req, res) {

};