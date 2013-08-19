
var divID = 0;
var newButton = document.getElementById("newButton");

var onNewButtonClicked = function() {
	$("#plumbContainer")[0].innerHTML += "<div id=\""+"plumbContainerDiv"+divID+"\"></div>";
	jsPlumb.addEndpoint("plumbContainerDiv"+divID);
	divID++;
};

var onReady = function() {
	jsPlumb.Defaults.Container = $("plumbContainer");
};

(function() {
	jsPlumb.ready(onReady);
	newButton.onclick = onNewButtonClicked;

})();

//http://jsplumbtoolkit.com/statemachine/demo-jquery.js