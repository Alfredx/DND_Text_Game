var fs = require('fs');
var anonymousSeq = 0;
var refresherID = null;
var logs = {};

var Logger = function (params) {
	this.logName = (new Date()).toDateString().replace(/[ ]/g,'-').toString() + '--' + (params.logName || ('Anonymous Log-' + anonymousSeq++));
	this.module = params.module || 'None';
	var _this = this;
	this.log = function(data,level) {
		if(!level)
			level = 'ok';
		if(data[data.length-1] !== '\n')
			data += '\n';
		switch(level){
			case 'error':
			case 'ERROR':
				data = '[ ERROR ] '+data;
				break;
			case 'ok':
			case 'OK':
				data = '[ OK ] '+data;
				break;
			case 'warning':
			case 'WARNING':
				data = '[ WARNING ] '+data;
				break;
			default:
				break;
		}
		data = '[ '+(new Date()).toLocaleTimeString() + ' ] ' + data;
		fs.appendFile('logs/'+this.logName,data,function(err){
			if(err)
				console.log('[ ERROR ] Can not append to LOG file: logs/'+_this.logName+'\n\t'+'- '+err.toString());
		});
	};
	if (!fs.existsSync('logs/'+this.logName)) {
		fs.open('logs/' + this.logName, 'a+', function(err, fd) {
			if (err) {
				console.log('[ ERROR ] Can not open LOG file: logs/' + _this.logName + '\n\t' + '-' + err.toString());
				return;
			}
			fs.close(fd);
		});
		var initText = 'Log file created. ';
		initText += '[ Module Name ] ' + _this.module + '\n';
		this.log(initText);
	}
	this.log('---------------------------------------');
	//logs.push(this);
}

LoggerSingleton = function(params){
	if (!logs[params.logName]){
		logs[params.logName] = new Logger(params);
	}
	return logs[params.logName];
}
exports.Logger = LoggerSingleton;

exports.logDailyRefresher = function(){
	var refresher = function(){
		var id = setInterval(function(){
			var h = (new Date()).getHours();
			if(h === 4){
				for(var i = 0; i < logs.length; i++){
					var name = logs[i].logName.substr(logs[i].logName.indexOf('--'));
					var module = logs[i].module;
					logs[i] = new LoggerSingleton({logName:name,module:module});
				} 
			}
		},3600000);
		return id;
	};
	refresherID = refresher();
	
};