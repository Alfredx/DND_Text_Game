var fs = require('fs');
var anonymousSeq = 0;
var refresherID = null;
var logs = new Array();

Logger = function (params) {
	this.logName = (new Date()).toDateString().replace(/[ ]/g,'-').toString() + '--' + (params.logName || ('Anonymous Log-' + anonymousSeq++));
	this.module = params.module || 'None';
	var _this = this;
	this.log = function(data) {
		if(data[data.length-1] !== '\n')
			data += '\n';
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
	logs.push(this);
	
}

exports.Logger = Logger;

exports.logDailyRefresher = function(){
	var refresher = function(){
		var id = setInterval(function(){
			var h = (new Date()).getHours();
			if(h === 4){
				for(var i = 0; i < logs.length; i++){
					var name = logs[i].logName.substr(logs[i].logName.indexOf('--'));
					var module = logs[i].module;
					logs[i] = new Logger({logName:name,module:module});
				} 
			}
		},3600000);
		return id;
	};
	refresherID = refresher();
};