exports.scriptsNode = function(lines, type, top, left){
	this.lines = lines;
	this.type = type;
	this.top = top;
	this.left = left;
	this.selections = new Array();
	this.nosharp = function(str){
		var nosharpstr = str;
		if (str.indexOf('#') == 0){
			var second = str.indexOf('#',1);
			var third = str.indexOf('#',second+1);
			if (second >= 0 && third >= 0){
				nosharpstr = str.substring(third+1,str.length);
			}
		}
		return nosharpstr;
	}
	this.toString = function(){
		
		var str = this.nosharp(this.lines);
		if (!this.selections.length)
			str += '-->结束<--';
		else{
			for (var i = 0; i < this.selections.length; i++) {
				str += '\n'+'回复 '+i+' : '+this.nosharp(this.selections[i].lines);
			};
		}
		return str;
	};
};

var ObserverObject = function(){
	this.name = 'ObserverObject';
}
ObserverObject.prototype.getName = function() {
	return this.name;
};
ObserverObject.prototype.update = function() {
	return;
};

exports.ObserverObject = ObserverObject;

exports.InRange = function(n, lowerbound, higherbound){
	return lowerbound <= n && n <= higherbound;
};