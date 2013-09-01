var nodeID = 1;

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
	//复制并拖出
	$(".module").draggable({
		helper: "clone"
	});
	$("#plumbContainer").droppable({
		drop: function(event, ui){
			if (ui.draggable[0].id == "clone"){
				$(this).append('<div class="w"'+
							   'id="node'+nodeID+'" '+
							   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
							   '>新节点'+nodeID+'<div class="ep"></div></div>');
				jsPlumb.draggable($("#node"+nodeID));
				jsPlumb.makeSource($("#node"+nodeID),sourceType);
				jsPlumb.makeTarget($("#node"+nodeID), {
					dropOptions : { hoverClass : "dragHover"},
					anchor : "Continuous"
				});
				var id = nodeID;
				$(this).find("#node"+nodeID).bind("click", function(){
					if(!$(this).find('#textarea')[0]){
						var origintext = $(this).html().substring(0,$(this).html().indexOf('<'));
						$(this).html('<textarea id="textarea" style="z-index: 5; width:100%"></textarea><div class="ep"></div>');
						var textarea = $(this).find('#textarea');
						var parent = $(this);
						textarea[0].onblur = function(){
							var text = textarea[0].value;
							parent.html(text+'<div class="ep"></div>');
						};
						textarea[0].value = origintext;
						textarea[0].focus();
						//移动光标到末尾
					    var len = textarea[0].value.length;
					    if (typeof textarea[0].selectionStart == 'number' && typeof textarea[0].selectionEnd == 'number') {
					        textarea[0].selectionStart = textarea[0].selectionEnd = len;
					    }
					}
				});
				nodeID++;
			}
		}
	});
	jsPlumb.bind("click",function(c) {
		jsPlumb.detach(c);
	});
	jsPlumb.bind("connection", function(info){
		info.connection.getOverlay("label").setLabel("");
	});

};

;(function() {
	jsPlumb.ready(onReady);

})();

//http://jsplumbtoolkit.com/statemachine/demo-jquery.js