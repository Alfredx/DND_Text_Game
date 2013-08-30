var nodeID = 0;
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

	jsPlumb.Defaults.Container = $("#plumbContainer");
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
            [ "Label", { label:"Click to detach", id:"label", cssClass:"aLabel" }]
		]
	});
	var sourceType = {
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
	};
	var windows = $(".w");
	jsPlumb.draggable(windows);
	$(".module").draggable({
		helper: "clone"
	});
	$("#plumbContainer").droppable({
		drop: function(event, ui){
			if (ui.draggable[0].id == "clone"){
				$(this).append('<div class="w"'+
							   'id="node'+nodeID+'" '+
							   '>新节点<div class="ep"></div></div>');
				jsPlumb.draggable($("#node"+nodeID));
				jsPlumb.makeSource($("#node"+nodeID),sourceType);
				jsPlumb.makeTarget($("#node"+nodeID), {
					dropOptions : { hoverClass : "dragHover"},
					anchor : "Continuous"
				});
				var id = nodeID;
				$(this).find("#node"+nodeID).bind("click", function(){
					if(!$(this).find('#input')[0]){
						jsPlumb.unmakeSource($("#node"+id));
						jsPlumb.unmakeTarget($("#node"+id));
						$(this).html('<input id="input" type="text"><div class="ep"></div>');
						
					}
				});
				nodeID++;
			}
		}
	});
	// $("#plumbContainer").on("drop", function(event, ui){
	// 		if (ui.draggable[0].className.indexOf("jq-draggable-outcontainer") > 0){
	// 			var name = ui.draggable[0].name;
	// 			alert(name);
	// 			switch(name){
	// 				case "clone":
	// 					$(this).find("p").append('<div class="w ui-draggable ui-droppable _jsPlumb_endpoint_anchor_"'+
	// 												'id="node'+nodeID+'" '+
	// 												'>新节点<div class="ep"></div></div>')
	// 					jsPlumb.makeSource(windows,sourceType);
	// 			}
	// 		}
	// 	});
	jsPlumb.bind("click",function(c) {
		jsPlumb.detach(c);
	});
	jsPlumb.makeSource(windows, sourceType);
	jsPlumb.bind("connection", function(info){
		info.connection.getOverlay("label").setLabel("");
	});
	jsPlumb.makeTarget(windows, {
		dropOptions : { hoverClass : "dragHover"},
		anchor : "Continuous"
	});

};

;(function() {
	jsPlumb.ready(onReady);

})();

//http://jsplumbtoolkit.com/statemachine/demo-jquery.js