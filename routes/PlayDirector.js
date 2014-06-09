var utils = require(__dirname + '/utils.js');
var Logger = require(__dirname + '/logger.js').Logger;

var logger = new Logger({logName:'PlayDirector',module:'PlayDirector.js'});

var PlayDirectorSingleton = function(){
	var instance = null;
	return {
		getInstance : function() {
			if (!instance){
				instance = new PlayDirector();
				logger.log('PlayDirector Singleton Created','ok');
				console.log('PlayDirector Singleton Created');
			}
			return instance;
		}
	}
};

exports.Director = new PlayDirectorSingleton();

var PlayManager = function(){
	this.maxtime = 600000;
	this.manageID = 1;
	this.underGoingPlays = {};
	this.recentPlays = {};	//started within 10 mins

	this.StartTimeLoop = function(){
		for (var uid in this.recentPlays){
			var now = new Date();
			if (now.getTime() - this.recentPlays[uid].startTime > this.maxtime){
				delete this.recentPlays[uid];
			}
		};
		setTimeout(this.StartTimeLoop,5000);
	}

	this.MakeDecisionGroup = function(play){
		var decisionGroup = {};
		try{
			var search = function(node){
				if (node.selections.length <= 0)
					return;
				if(node.type === 'decide'){
					var secondsharp = node.lines.indexOf('#',1);
					var thirdsharp = node.lines.indexOf('#',secondsharp+1);
					if (secondsharp < 0 || thirdsharp < 0)
						throw 'nosharp';
					var groupid = node.lines.substring(1,secondsharp);
					var branchid = node.lines.substring(secondsharp+1,thirdsharp);
					if (!decisionGroup[groupid])
						decisionGroup[groupid] = {};
					if (!decisionGroup[groupid][branchid])
						decisionGroup[groupid][branchid] = 0;
				}
				for (var i in node.selections){
					search(node.selections[i]);
				}
			}
			search(play.entry[0]);
			console.log(decisionGroup);
			return decisionGroup;
		}
		catch (error){
			if(error == 'nosharp'){
				return {};
			}
		}
	}

	this.AddPlay = function(play,playerid){
		var playManageInfo = {
			uid : this.manageID,
			startTime : (new Date()).getTime(),
			play : play,
			playersCount : 1,
			currentPlayers : [playerid],
			decisionGroup : this.MakeDecisionGroup(play)
		}
		var uid = this.manageID;
		this.underGoingPlays[uid] = playManageInfo;
		this.recentPlays[uid] = playManageInfo;
		this.manageID++;
		return new PlayService(play,uid);
	}

	this.JoinPlay = function(uid,playerid){
		this.underGoingPlays[uid].currentPlayers.push(playerid);
		this.underGoingPlays[uid].playersCount++;
		console.log(this.underGoingPlays[uid].playersCount);
		console.log(this.recentPlays[uid].playersCount);
		this.recentPlays[uid].playersCount = this.underGoingPlays[uid].playersCount;
		this.recentPlays[uid].currentPlayers = this.underGoingPlays[uid].currentPlayers;
		return new PlayService(this.underGoingPlays[uid].play,uid);
	}

	this.ExitPlay = function(playerid,uid){
		try{
			console.log(this.underGoingPlays[uid].currentPlayers);
			for(var i in this.underGoingPlays[uid].currentPlayers){
				if(this.underGoingPlays[uid].currentPlayers[i] === playerid)
					delete this.underGoingPlays[uid].currentPlayers[i];
			}
			this.underGoingPlays[uid].playersCount--;
			if (this.underGoingPlays[uid].playersCount === 0){
				delete this.underGoingPlays[uid];
				delete this.recentPlays[uid];
			}
			else{
				this.recentPlays[uid].playersCount = this.underGoingPlays[uid].playersCount;
				this.recentPlays[uid].currentPlayers = this.underGoingPlays[uid].currentPlayers;
				console.log(this.underGoingPlays[uid].playersCount);
				console.log(this.recentPlays[uid].playersCount);
			}
		}
		catch (e){
			logger.log(e,'error')
			logger.log('ExitPlay found no playerid', 'error');
			logger.log('playerid: '+playerid,'error');
			logger.log(this.underGoingPlays[uid].currentPlayers,'error');
		}
		
	}

	this.NewPlayer = function(play,playerid){
		var uid = -1;
		var newestPlayInfo = null;
		var startedTime = this.maxtime;
		for(var i in this.recentPlays){
			if (this.recentPlays[i].play.name === play.name) {
				var now = (new Date()).getTime();
				if (now - this.recentPlays[i].startTime < startedTime) {
					startedTime = now - this.recentPlays[i].startTime;
					newestPlayInfo = this.recentPlays[i];
					uid = i;
				};
			};
		}
		if(newestPlayInfo && uid){
			return this.JoinPlay(uid,playerid);
		}
		else{
			return this.AddPlay(play,playerid);
		}
	}

	this.MakeDecision = function(uid,playerid,groupid,branchid){
		this.underGoingPlays[uid].decisionGroup[groupid][branchid]++;
		console.log(this.underGoingPlays[uid].decisionGroup);
	}
	this.QueryResult = function(uid,playerid,groupid){
		console.log(this.underGoingPlays[uid].decisionGroup);
		var group = this.underGoingPlays[uid].decisionGroup[groupid]
		var max = 0;
		var branch = 0;
		var minbranch = null;
		for(var i in group){
			if(group[i] > max){
				max = group[i];
				branch = i;
			}
			if(!minbranch)
				minbranch = i;
			else if (i < minbranch)
				minbranch = i;
		}
		if (max){
			return '#'+groupid+'#'+branch+'#';
		}
		else{
			return '#'+groupid+'#'+minbranch+'#';
		}
	}
}

var manager = new PlayManager();
manager.StartTimeLoop();

var PlayerBinding = function(playerid){
	this.playerid = playerid;
	this.play = null;
	this.newPlayService = null;
	this.currentService = null;
	//0 for no play
	//1 for playing
	this.state = 0;
	this.Init = function(newPlayService){
		this.state = 0;
		this.newPlayService = newPlayService;
		this.currentService = this.newPlayService;
	}
	this.ApplyService = function(service){
		if(service)
			this.currentService = service;
		else{
			this.state = 0;
			this.newPlayService.state = 0;
			this.currentService = this.newPlayService;
		}
	}
	this.NewMessage = function(message,playerid){
		return this.currentService.NewMessage(message,playerid);
	}
};
var PlayService = function(play,uid){
	this.playuid = uid;
	this.play = play;
	this.currentNode = play.entry[0];
	console.log(this.currentNode.lines);
	this.getDecisionNumber = function(str){
		if (str.length === 0)
			return NaN;
		if (str[0] === '#'){
			var p = str.indexOf('#',1);
			if (p<0)
				return NaN;
			var num = str.substring(1,p);
			if (isNaN(num))
				return parseInt(num,10);
			else
				return NaN;
		}
		else
			return NaN;
	}
	this.NewMessage = function(message,playerid){
		var number = parseInt(message)
		var res = 2;
		var ret = '';
		if (message === 'exit' || message ==='退出') {
			res = 3;
			ret = this.playuid;
		}
		else if (isNaN(number) || !utils.InRange(number,0,this.currentNode.selections.length-1)){
			ret = this.currentNode.toString();
		}
		else{
			//console.log(message,number,this.currentNode.selections);
			ret = this.currentNode.selections[number].toString();
			this.currentNode = this.currentNode.selections[number];
			if(this.currentNode.type === 'decide'){	//this current is the next node
				var secondsharp = this.currentNode.lines.indexOf('#',1);
				var thirdsharp = this.currentNode.lines.indexOf('#',secondsharp+1);
				var groupid = this.currentNode.lines.substring(1,secondsharp);
				var branchid = this.currentNode.lines.substring(secondsharp+1,thirdsharp);
				manager.MakeDecision(this.playuid,playerid,groupid,branchid);
			}
			if(this.currentNode.type === 'branch'
				|| this.currentNode.type === 'decide'){
				this.currentNode = this.currentNode.selections[0];
				ret = this.currentNode.toString();
			}
			var groupid = '';
			for (var i in this.currentNode.selections){
				if (this.currentNode.selections[i].type === 'result'){
					var lines = this.currentNode.selections[i].lines
					groupid = lines.substring(1,lines.indexOf('#',1));
					console.log(groupid);
					break;
				}
			}
			if(groupid){
				var seq = manager.QueryResult(this.playuid,playerid,groupid);
				console.log(seq);
				for (var i in this.currentNode.selections){
					if (this.currentNode.selections[i].lines.indexOf(seq) == 0){
						ret = this.currentNode.lines+'\n'+'回复 '+i+' ：'+this.currentNode.selections[i].nosharp(this.currentNode.selections[i].lines);
						this.currentNode = this.currentNode.selections[i];
						break;
					}
				}
			}
			
			if (this.currentNode.type === 'end'){
				res = 3;
				ret = this.playuid;
			}
		}
		return {
			result : res,
			content : ret
		}
	};
};

var NewPlayService = function(roots){
	this.roots = roots;
	// 0 for new play
	// 1 for choosing play
	this.state = 0;
	this.NewMessage = function(message,playerid){
		if (this.state === 0){
			this.state = 1;
			return {
				result : 0,
				content : this.ShowPlays()
			};
		}
		else if(this.state === 1){
			this.state = 0;
			var number = parseInt(message);
			if (isNaN(number)){
				return this.NewMessage(message,playerid);
			}
			var play = this.SelectPlay(number,playerid);
			if (!play){
				return this.NewMessage(message,playerid);
			}
			return {
				result : 1,
				content : play
			}
		}
	}
	this.SelectPlay = function(i,playerid){
		if(utils.InRange(i,0,this.roots.length-1)){
			return manager.NewPlayer(this.roots[i],playerid);
		}
		else{
			return null;
		}
	};
	this.ShowPlays = function(){
		var str = '选择你的剧本：\n';
		for (var i = 0; i < this.roots.length; i++){
			str += '回复 '+i+' ：'+this.roots[i].name+'\n';
		}
		return str;
	};
};

var PlayDirector = function(){
	this.name = 'PlayDirector';
	this.roots = new Array();
	this.bindings = {};
	this.LoadRoots = function(roots){
		console.log('LoadRoots in PlayDirector');
		for (var name in roots){
			this.roots[roots[name].id] = roots[name];
		}
	};
	this.NewBinding = function(playerid){
		var binding = new PlayerBinding(playerid);
		binding.Init(new NewPlayService(this.roots));
		this.bindings[playerid] = binding;
	};
	this.PlayerMessage = function(playerid,message){
		var binding = this.bindings[playerid];
		if (binding){
			var ret = binding.NewMessage(message,playerid);
			// 0 for choose play
			// 1 for return chosen play
			// 2 for play choose branch
			// 3 for play ends
			if (ret.result === 1){
				binding.ApplyService(ret.content);
				ret = binding.NewMessage(NaN,playerid);
			}
			else if (ret.result === 3){
				manager.ExitPlay(playerid,ret.content);
				binding.ApplyService(null);
				return '剧本已结束\n'+this.PlayerMessage(playerid,0);
			}
			return ret.content;
		}
		else{
			this.NewBinding(playerid);
			return this.PlayerMessage(playerid,message);
		}
	};
	
};
PlayDirector.prototype = new utils.ObserverObject();
PlayDirector.prototype.update = function(roots){
	this.LoadRoots(roots);
};

