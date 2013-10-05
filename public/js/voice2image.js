
function Voice2Image(params) {
	params = params || {};
	this.draw = params.draw || false;
	this.stream = null;
	this.canvas = null;
	this.drawContext = null;
	this.isRecording = false;
	this.audioRecorder = new AudioRecorder();
}

Voice2Image.prototype.init = function() {
	var parent = this;
	this.audioRecorder.addCallback.bind(parent)(function(){
		parent.stream = parent.audioRecorder.stream;
		parent.analyser = parent.audioRecorder.analyser;
		parent.freqs = new Float32Array(parent.analyser.frequencyBinCount);
	},this.audioRecorder);
	this.audioRecorder.init.bind(this.audioRecorder)();

};

Voice2Image.prototype.errorInitCallback = function(err){
	console.log(err.name + ': ' + err.message);
};

Voice2Image.prototype.loop = function(timestep) {
	this.analyser.getFloatFrequencyData(this.freqs);
	// var min = Infinity;
	// var max = -Infinity;
	// for(var i = 0; i < this.freqs.length; i++){
	// 	if(this.freqs[i] < min)
	// 		min = this.freqs[i];
	// 	if(this.freqs[i] > max)
	// 		max = this.freqs[i];
	// }
	// console.log(min,max);
	if(this.draw)
		this.debugDraw();
	if(this.isRecording)
		requestAnimationFrame(this.loop.bind(this));
};

Voice2Image.prototype.initCanvas = function() {
	var canvas = document.querySelector('canvas');
	if (!canvas) {
		canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
	}
	canvas.width = document.body.offsetWidth;
	canvas.height = 600;
	this.canvas = canvas;
	this.drawContext = canvas.getContext('2d');
	this.drawContext.translate(0.5*canvas.width,0.5*canvas.height);
	this.drawContext.rotate(Math.PI /2.0);
};

Voice2Image.prototype.debugDraw = function() {
	this.canvas.width = document.body.offsetWidth;
	this.drawContext.translate(0.5*this.canvas.width,0.5*this.canvas.height);
	this.drawContext.rotate(Math.PI /2.0);
	var r = this.canvas.width / Math.PI / 2.0;
	this.drawContext.fillStyle = this.getRGBA(value);
	for (var i = 0; i < this.freqs.length; i++) {

		var value = this.freqs[i];
		var offset = -value - 131;
		var barWidth = this.canvas.width/this.freqs.length;

		var rectWidth = 2;
		var rectHeight = 2;
		
		// this.drawContext.fillRect(i * barWidth-0.5*this.canvas.width, offset, 1, 1);
		var iw = 4*r/this.freqs.length;
		if(i < this.freqs.length/4){
			var x = i*iw-r;
			var y = Math.sqrt(r*r-(x)*(x));
			var v = this.vectorRotate(-offset*2.5,x,y,true);
			this.drawContext.fillRect(x+v.x, y+v.y, rectWidth, rectHeight);
		}
		else if(i < this.freqs.length/2){
			var x = i*iw-r;
			var y = Math.sqrt(r*r-(x)*(x));
			var v = this.vectorRotate(-offset*2.5,x,y,false);
			this.drawContext.fillRect(x+v.x, y+v.y, rectWidth, rectHeight);
			//bot circle
			//this.drawContext.fillRect(x , Math.sqrt(r*r-(x)*(x))+offset*2.5, 1,1);
		}
		else if(i < this.freqs.length*3/4){
			var x = r-iw*(i-this.freqs.length/2);
			var y = -Math.sqrt(r*r-(x)*(x));
			var v = this.vectorRotate(offset*2.5,x,y,false);//it should be true here
			this.drawContext.fillRect(x+v.x, y+v.y, rectWidth, rectHeight);
			//upper circle
			//this.drawContext.fillRect(x, -Math.sqrt(r*r-(x)*(x))-offset*2.5, 1,1);
		}
		else{
			var x = r-iw*(i-this.freqs.length/2);
			var y = -Math.sqrt(r*r-(x)*(x));
			var v = this.vectorRotate(offset*2.5,x,y,true);//it should be false here
			this.drawContext.fillRect(x+v.x, y+v.y, rectWidth, rectHeight);
		}
	}
};

Voice2Image.prototype.vectorRotate = function(value,x,y,cclockwise){
	var OB = {x: -x, y: -y};
	var BA = {x: 0, y: cclockwise?value:-value};
	var cos = (OB.x*BA.x + OB.y*BA.y)/(Math.sqrt(OB.x*OB.x+OB.y*OB.y)*Math.sqrt(BA.x*BA.x+BA.y*BA.y));
	var sin = Math.sqrt(1-cos*cos);
	var BC = {};
	if(cclockwise){
		BC.x = BA.x*cos+BA.y*sin;
		BC.y = BA.x*(-sin)+BA.y*cos;
	}
	else{
		BC.x = BA.x*(-cos)+BA.y*sin;
		BC.y = BA.x*(-sin)+BA.y*(-cos);
	}
	return BC;
};

Voice2Image.prototype.getRGBA = function(value) {
	var millis = (new Date()).getTime();
	return 'rgba('+millis%255+','+(millis+100)%255+','+(millis+200)%125+',5)';
};

$(document).ready(function(){
	var v2i = new Voice2Image({draw:true});
	v2i.init.bind(v2i)();
	// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
	// navigator.getUserMedia({audio:true}, v2i.initMediaStream.bind(v2i), v2i.errorInitCallback.bind(v2i));
	$('#voice').click(function(){
		if(!v2i.stream){
			alert("No media!");
			return;
		}
		$("#audio")[0].src = webkitURL.createObjectURL(v2i.stream);
		v2i.isRecording = !v2i.isRecording;
		if(v2i.isRecording)
			v2i.initCanvas();
		v2i.loop();
	});
});