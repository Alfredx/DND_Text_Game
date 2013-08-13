

this.allScripts = ['0','1'];

this.scriptNode = function() {
	this.lines = null;

	this.parent = null;

	this.children = new Array();

	this.next = function(num) {
		return this.children[num];
	};

	this.back = function() {
		return this.parent;
	};
};

this.scriptTreeBuilder = function(selectType) {
	var script = null;
	if(selectType === 'random')
		script = this.getRandomScript();
	

};

this.getRandomScript = function() {
	return this.allScripts[0];
};