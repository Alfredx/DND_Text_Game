
// import modules
var express = require('express');
var wechat = require(__dirname+'/routes/wechat.js');
var handler = require(__dirname+'/routes/handler.js');
var scriptsHandler = require(__dirname+'/routes/scripts_handler.js');
var scriptsLoader = require(__dirname+'/routes/scripts_loader.js');
var playdirector = require(__dirname+'/routes/PlayDirector.js');
var http = require('http');
var path = require('path');
var sio = require('socket.io');
var Logger = require(__dirname+'/routes/logger.js').Logger;

var app = express();

var version = 0.1;
var logger = new Logger({logName:'NodeServer',module:'app.js'});
logger.log('starting server','ok');
logger.log('version: '+version,'ok');

app.set('port', process.env.PORT || 8866);
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.methodOverride());

app.use(app.router);
app.use('/public', express.static(path.join(__dirname, 'public'/*, {maxAge: 604800000}*/)));
//use md5 check to clear cache? how?
//wechat message
app.use(express.query());
app.use(express.cookieParser());
app.use(express.session({secret:'everything can be a secret?', cookie:{maxAge:900000}}));
app.use('/wechat',wechat.handler);

// app.get('/', handler.index);
app.get('/dev', handler.render);
app.get('/dev/scripts', scriptsHandler.render);
app.get('/wechat',wechat.render);
app.post('/msg',handler.msgHandle);


var loveHandler = require(__dirname+'/routes/love.js');
app.get('/', loveHandler.render);

var server = http.createServer(app);
var io = sio.listen(server, {log: false});

var director = playdirector.Director.getInstance();
scriptsLoader.registerUser(wechat);
scriptsLoader.registerUser(director);
scriptsLoader.registerUser(scriptsHandler.observer);
scriptsLoader.onload(version);

handler.setDirector(director);
handler.newConnection(io,logger);
handler.initIO(io);//only for web user
scriptsHandler.setVersion(version);
scriptsHandler.initIO(io);	//io.of('/scripts')



server.listen(app.get('port'), function(){
	console.log('Server linstening on port '+app.get('port'));
	logger.log('Server linstening on port '+app.get('port'));
});

