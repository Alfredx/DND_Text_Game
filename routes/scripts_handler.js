var fs = require('fs');
var xml2js = require('xml2js');

var xmlpath = 'drama_scripts/';

var regroupData = function(data){
	//TODO
	return 1;
};

var checkValidation = function(root){
	//TODO
	if(!root)
		return false;
	else
		return root;
};

var onSave = function(data, socket){
	if(checkValidation(regroupData(data)))
		{}//save root
	else
		return;
	if(!data.name)
		data.name = 'temp';
	var xml = '<'+data.name+'>\n';
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
		if(err)
			throw err;
		fs.readFile(xmlpath+data.name+'.xml', function(err, data){
			var parser = new xml2js.Parser();
			parser.parseString(data,function(err, result) {
				console.log(result);
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