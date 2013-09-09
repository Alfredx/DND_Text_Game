var fs = require('fs');
var xml2js = require('xml2js');
var utils = require(__dirname + '/utils.js');

var xmldirpath = 'drama_scripts/';

var scriptsNode = utils.scriptsNode;

var roots = {};

var readXML = function(dir){
	fs.readFile(dir, function(err, data){
		var parser = new xml2js.Parser();
		parser.parseString(data,function(err, result) {
			if(err){
				console.log('[ERROR] invalid XML file: '+dir);
			}
			var root = {
				entry: new Array(),
				name: null
			};
			var nodes = {};
			for(var name in result){
				root.name = name;
				var o_node = result[name]['node'];
				var o_connection = result[name]['connection'];
				for(var uid in o_node){
					nodes[o_node[uid].id[0]] = new scriptsNode(o_node[uid].lines[0], o_node[uid].type[0]);
					var n = o_node[uid].id[0].split('-');
					if(n[0] === 'start')
						root.entry.push(nodes[o_node[uid].id[0]]);
				}
				for(var uid in o_connection){
					var s = o_connection[uid].sourceId[0].split('-');
					var t = o_connection[uid].targetId[0].split('-');
					nodes[s.join('-')].selections.push(nodes[t.join('-')]);
				}
			}
			roots[root.name] = root;
		});
	});
};

exports.onload = function(){
	var files = fs.readdirSync(xmldirpath);
	for(var i in files){
		readXML(xmldirpath+files[i]);
	}
	var id = null;
	id = setInterval(function(){
		console.log('loading XMLs...');
		var i = 0;
		for(var name in roots)
			i++;
		if(i == files.length){
			clearInterval(id);
			console.log('All XML loaded');
		}
	},1000);
};

exports.getRoots = function() {
	return roots;
};