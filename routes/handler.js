var fs = require('fs');
var xml2js = require('xml2js');
var loader = require(__dirname + '/scripts_loader.js');

var scriptsRoots = loader.getRoots();

var log = function(content) {
	var date = new Date();
	date = date.toLocaleTimeString();
	console.log('['+date+"]\n"+content);
};

//used in dev
var initSocket = function(socket){
	socket.emit('hello', 'hello this is server! let\'s play!');
	var currentScripts = null;
	for(var name in scriptsRoots){
		currentScripts = scriptsRoots[name];
	}
	socket.emit('msg', {
		pre: '['+[currentScripts.name]+']',
		msg: currentScripts.entry[0].lines
	});
	socket.on('echo', function(data){
		log('socket now is set up');
	});

	socket.on('msg', function(data){
		log('[user]: '+data);
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

exports.initIO = function(io) {
	io.of('/dev').on('connection', function(socket) {
        initSocket(socket);
    });
};

exports.msgHandle = function(req, res) {

};
