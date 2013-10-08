var fs = require('fs');
var xml2js = require('xml2js');
var loader = require(__dirname + '/scripts_loader.js');

var scriptsRoots = loader.getRoots();

//used in dev
var initSocket = function(socket){
	socket.emit('hello', 'hello this is server! let\'s play!');
	var currentScripts = null;
	for(var name in scriptsRoots){
		currentScripts = scriptsRoots[name];
	}
	// socket.emit('msg', {
	// 	pre: '['+[currentScripts.name]+']',
	// 	msg: currentScripts.entry[0].lines
	// });
	socket.on('echo', function(data){
		console.log('socket now is set up');
	});

	socket.on('msg', function(data){
		console.log('[user]: '+data);
		socket.emit('msg', {
			pre : 'echo msg: ',
			msg : data, 
		});
	});
};

exports.index = function(req, res) {
	var context = {
		title : "Coming soon..."
	};
	res.render('index',context);
};

//for development use
exports.render = function(req, res) {
	var context = {
		title : "For Development"
	};
	res.render('dev_index',context);
};

exports.newConnection= function(io, logger){
	io.sockets.on('connection', function(socket){
		var ip = socket.handshake.address.address;
		var port = socket.handshake.address.port;
		logger.log('New connection - '+ip+':'+port,'ok');
		console.log('New connection - '+ip+':'+port);
	});
};

exports.initIO = function(io) {
	io.of('/dev').on('connection', function(socket) {
        initSocket(socket);
    });
};

exports.msgHandle = function(req, res) {

};
