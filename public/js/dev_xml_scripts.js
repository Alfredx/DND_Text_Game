
var divID = 0;
var newButton = document.getElementById("newButton");

var onNewButtonClicked = function() {
	$("#plumbContainer")[0].innerHTML += "<div id=\""+"plumbContainerDiv"+divID+"\" class=\"w ui-draggable ui-droppable\">pulmbContainerDiv"+divID+"<div class=\"ep\"></div></div>";
	//jsPlumb.addEndpoint("plumbContainerDiv"+divID);
	divID++;
};

var onReady = function() {
	var resetRenderMode = function(desiredMode) {
		var newMode = jsPlumb.setRenderMode(desiredMode);
		$(".rmode").removeClass("selected");
		$(".rmode[mode='" + newMode + "']").addClass("selected");		

		$(".rmode[mode='canvas']").attr("disabled", !jsPlumb.isCanvasAvailable());
		$(".rmode[mode='svg']").attr("disabled", !jsPlumb.isSVGAvailable());
		$(".rmode[mode='vml']").attr("disabled", !jsPlumb.isVMLAvailable());
	};
     
	$(".rmode").bind("click", function() {
		var desiredMode = $(this).attr("mode");
		if (jsPlumbDemo.reset) jsPlumbDemo.reset();
		jsPlumb.reset();
		resetRenderMode(desiredMode);					
	});	

	resetRenderMode(jsPlumb.SVG);

	jsPlumb.Defaults.Container = $("plumbContainer");
	jsPlumb.importDefaults({
		Endpoint : ["Dot", {radius:2}],
		HoverPaintStyle : {strokeStyle:"#1e8151", lineWidth:2 },
		ConnectionOverlays : [
			[ "Arrow", { 
				location:1,
				id:"arrow",
                length:14,
                foldback:0.8
			} ],
            [ "Label", { label:"FOO", id:"label", cssClass:"aLabel" }]
		]
	});
	var windows = $(".w");
	jsPlumb.draggable(windows);
	jsPlumb.bind("click",function(c) {
		jsPlumb.detach(c);
	});
	jsPlumb.makeSource(windows, {
		filter: ".ep",
		anchor: "Continuous",
		connector: ["StateMachine", {curviness : 20}],
		connectorStyle: { strokeStyle:"#5c96bc", 
						  lineWidth:2, 
						  outlineColor:"transparent",
						  outlineWidth:4 },
		maxConnections:99,
		onMaxConnections: function(info, e) {
			alert("Maximun connections (" + info.maxConnections + ") reached");
		}
	});
	jsPlumb.bind("connection", function(info){
		info.connection.getOverlay("label").setLabel("click to detach");
	});
	jsPlumb.makeTarget(windows, {
		dropOptions : { hoverClass : "dragHover"},
		anchor : "Continuous"
	});

};

;(function() {
	jsPlumb.ready(onReady);
	newButton.onclick = onNewButtonClicked;

})();

//http://jsplumbtoolkit.com/statemachine/demo-jquery.js