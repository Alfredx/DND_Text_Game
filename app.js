
// import modules
var express = require('express');
var handler = require('./routes/handler');
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'tmp')));

app.get('/',handler.index);
app.get('/dev', handler.dev);
app.post('/msg',handler.msgHandle);

var server = http.createServer(app);
var io = sio.listen(server, {log: true});

handler.initIO(io);//only for web user

server.listen(app.get('port'), function(){
	console.log('Server linstening on port '+app.get('port'));
});