var fs = require('fs');
var xml2js = require('xml2js');

var xmlpath = 'drama_scripts/';

var scriptsRoots = {};

var scriptsNode = function(lines, type){
	this.lines = lines;
	this.type = type;
	this.selections = new Array();
};

var regroupData = function(data){
	if(!data)
		return false;
	var root = {
		entry: new Array(),
		name: data.name
	};
	var nodes = {};
	for(var uid in data.nodes){
		nodes[uid] = new scriptsNode(data.nodes[uid].lines, data.nodes[uid].type);
		var n = data.nodes[uid].id.split('-');
		if(n[0] === 'start')
			root.entry.push(nodes[uid]);
	}
	for(var uid in data.connections){
		var s = data.connections[uid].sourceId.split('-');
		var t = data.connections[uid].targetId.split('-');
		nodes[s.join('-')].selections.push(nodes[t.join('-')]);
	}
	return root;
};

var checkValidation = function(data){
	var isEmpty = function(obj){
		for(var name in obj){
			return false;
		}
		return true;
	};
	//TODO
	if(isEmpty(data.nodes) || isEmpty(data.connections))
		return false;
	else
		return data;
};

var onSave = function(data, socket){
	var root = regroupData(checkValidation(data));
	if(root){
		scriptsRoots[root.name] = root;
	}
	else{
		socket.emit('error', 'Invalid scripts');
		return;
	}
	if(!data.name)
		data.name = 'temp';
	var xml = '<?xml version="1.0"?>\n';
	xml += '<'+data.name+'>\n';
	for(var uid in data.nodes){
		xml += '\t<node>\n';
		xml += '\t\t<id>'+data.nodes[uid].id+'</id>\n';
		xml += '\t\t<type>'+data.nodes[uid].type+'</type>\n';
		xml += '\t\t<lines>'+data.nodes[uid].lines+'</lines>\n';
		xml += '\t</node>\n';
	}
	for(var uid in data.connections){
		xml += '\t<connection>\n';
		xml += '\t\t<sourceId>'+data.connections[uid].sourceId+'</sourceId>\n';
		xml += '\t\t<targetId>'+data.connections[uid].targetId+'</targetId>\n';
		xml += '\t</connection>\n';
	}
	xml += ('</'+data.name+'>\n');
	fs.writeFile(xmlpath+data.name+'.xml', xml, function(err){
		if(err){
			socket.emit('error', 'error happen when saving file:\n'+err.toString());
			throw err;
		}
		fs.readFile(xmlpath+data.name+'.xml', function(err, data){
			var parser = new xml2js.Parser();
			parser.parseString(data,function(err, result) {
				console.dir(result);
				socket.emit('echosave',result);
			});
		});
	});

};

var initSocket = function(socket){
	socket.on("onsave", function(data){
		onSave(data, socket);
	});
};

exports.initIO = function(io){
	io.of('/scripts').on('connection', function(socket){
		initSocket(socket);
	});
}