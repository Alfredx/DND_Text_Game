
// import modules
var express = require('express');
var handler = require(__dirname+'/routes/handler.js');
var scriptsHandler = require(__dirname+'/routes/scripts_handler.js');
var scriptsLoader = require(__dirname+'/routes/scripts_loader.js');
var http = require('http');
var path = require('path');
var sio = require('socket.io');

var app = express();

app.set('port', process.env.PORT || 8866);
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.methodOverride());

//app.use(express.session());
app.use(app.router);
app.use('/public', express.static(path.join(__dirname, 'public'/*, {maxAge: 604800000}*/)));
//use md5 check to clear cache? how?

app.get('/', handler.index);
app.get('/dev', handler.render);
app.get('/dev/scripts', scriptsHandler.render);
app.post('/msg',handler.msgHandle);

var honeyHandler = require(__dirname+'/routes/honey_handler.js');
app.get('/honey', honeyHandler.honey);

var server = http.createServer(app);
var io = sio.listen(server, {log: true});

scriptsLoader.onload();

handler.initIO(io);//only for web user
scriptsHandler.initIO(io);	//io.of('/scripts')

server.listen(app.get('port'), function(){
	console.log('Server linstening on port '+app.get('port'));
});