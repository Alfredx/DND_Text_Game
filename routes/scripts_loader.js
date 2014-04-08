
var fs = require('fs');
var xml2js = require('xml2js');
var utils = require(__dirname + '/utils.js');
var Logger = require(__dirname + '/logger.js').Logger;

var xmldirpath = 'drama_scripts/';
var scriptsNode = utils.scriptsNode;
var xmlversion = 0.1;
var validFiles = 0;
var registedUsers = [];
var roots = {};
var logger = new Logger({logName:'Script Loader',module:'scripts_loader.js'});

var readXML = function(dir) {
	fs.readFile(dir, function(err, data) {
		var parser = new xml2js.Parser();
		parser.parseString(data, function(err, result) {
			if (err) {
				logger.log('invalid XML file: ' + dir,'error');
				logger.log(err,'error');
				validFiles--;
				return;
			}
			var root = {
				entry: new Array(),
				name: null
			};
			var nodes = {};
			for (var name in result) {
				root.name = name;
				console.log('[ OK ] loading -> '+name);
				if (result[name]['version'] <= xmlversion)
					delete result[name]['version'];
				else {
					validFiles--;
					logger.log('invalid XML version -created by newer versions: ' + dir,'error');
					return;
				}
				var o_node = result[name]['node'];
				var o_connection = result[name]['connection'];
				for (var uid in o_node) {
					nodes[o_node[uid].id[0]] = new scriptsNode(o_node[uid].lines[0], o_node[uid].type[0], o_node[uid].top[0], o_node[uid].left[0]);
					var n = o_node[uid].id[0].split('-');
					if (n[0] === 'start')
						root.entry.push(nodes[o_node[uid].id[0]]);
				}
				for (var uid in o_connection) {
					var s = o_connection[uid].sourceId[0].split('-');
					var t = o_connection[uid].targetId[0].split('-');
					nodes[s.join('-')].selections.push(nodes[t.join('-')]);
				}
			}
			roots[root.name] = root;
		});
	});
};

exports.onload = function(version) {
	xmlversion = version;
	var files = fs.readdirSync(xmldirpath);
	validFiles = files.length;
	for (var i in files) {
		readXML(xmldirpath + files[i]);
	}
	var id = null;
	id = setInterval(function() {
		var i = 0;
		for (var name in roots)
			i++;
		logger.log('loading XMLs...current loaded: '+i,'ok');
		console.log('[ OK ] loading XMLs...current loaded: '+i);
		if (i == validFiles) {
			clearInterval(id);
			logger.log('All XML loaded. Total: '+i,'ok');			
			console.log('[ OK ] All XML loaded. Total: '+i);
			for(var i in registedUsers){
				registedUsers[i].setRoots(roots);
				registedUsers[i].onLoaderUpdate();
			};
		}
	}, 1000);
};

exports.getRoots = function() {
	return roots;
};

exports.registerUser = function(user){
	registedUsers.push(user);
};