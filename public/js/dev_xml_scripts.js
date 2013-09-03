var startID = 1;
var nodeID = 1;
var branchID = 1;
var endID = 1;

var sourceType = function() {
	type = {
		filter: ".ep",
		anchor: "Continuous",
		connector: ["StateMachine", {curviness : 20}],
		connectorStyle: { strokeStyle:"#5c96bc", 
						  lineWidth:2, 
						  outlineColor:"transparent",
						  outlineWidth:4 },
		maxConnections: 99 ,
		onMaxConnections: function(info, e) {
			alert("Maximun connections (" + info.maxConnections + ") reached");
		}
	};
	return type;
};

var makeElement = function(jquery_element){
	jsPlumb.draggable(jquery_element);
	if(jquery_element[0].id.indexOf("end")<0){
		var sourcetype = sourceType();
		if(jquery_element[0].id.indexOf("branch") >= 0)
			sourcetype.maxConnections = 1;
		jsPlumb.makeSource(jquery_element,sourcetype);
	}
	if(jquery_element[0].id.indexOf("start")<0){
		jsPlumb.makeTarget(jquery_element, {
			dropOptions : { hoverClass : "dragHover"},
			anchor : "Continuous"
		});
	}
};

var bindClickEvent = function(element){
	element.bind("click", function(){
		if(!$(this).find('#textarea')[0]){
			var origintext = $(this).html().substring(0,$(this).html().indexOf('<'));
			$(this).html('<textarea id="textarea" style="z-index: 5; width:100%"></textarea><div class="ep"></div>');
			var textarea = $(this).find('#textarea');
			var parent = $(this);
			textarea[0].onblur = function(){
				var text = textarea[0].value;
				if(!text)
					text = origintext;
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
	
	//复制并拖出
	$(".module").draggable({
		helper: "clone"
	});
	$("#plumbContainer").droppable({
		drop: function(event, ui){
			switch(ui.draggable[0].id){
			case "start_clone":
				$(this).append('<div class="start w"'+
							   'id="start'+startID+'" '+
							   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
							   '>新剧本入口'+startID+'<div class="ep"></div></div>');
				makeElement($("#start"+startID));
				bindClickEvent($("#start"+startID));
				startID++;
				break;
			case "node_clone":
				$(this).append('<div class="node w"'+
							   'id="node'+nodeID+'" '+
							   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
							   '>新节点'+nodeID+'<div class="ep"></div></div>');
				makeElement($("#node"+nodeID));
				bindClickEvent($("#node"+nodeID));
				nodeID++;
				break;
			case "branch_clone":
				$(this).append('<div class="branch w"'+
							   'id="branch'+branchID+'" '+
							   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
							   '>新分支'+branchID+'<div class="ep"></div></div>');
				makeElement($("#branch"+branchID));
				bindClickEvent($("#branch"+branchID));
				branchID++;
				break;
			case "end_clone":
				$(this).append('<div class="end w"'+
							   'id="end'+endID+'" '+
							   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
							   '>新结束点'+endID+'<div class="ep"></div></div>');
				makeElement($("#end"+endID));
				bindClickEvent($("#end"+endID));
				endID++;
				break;
			}
		}
	});
	$("#sidebar").droppable({
		drop: function(event, ui){
			if(ui.draggable[0].id != "node_clone")
				ui.draggable.remove();
		}
	});
	jsPlumb.bind("click",function(c) {
		jsPlumb.detach(c);
	});
	jsPlumb.bind("connection", function(info){
		var sts1 = info.connection.sourceId.indexOf("branch") >= 0;
		var sts2 = info.connection.targetId.indexOf("branch") >= 0;
		var statement = (sts1 || sts2) && !(sts1 && sts2);
		if(statement)
			info.connection.getOverlay("label").setLabel("");
		else
			jsPlumb.detach(info.connection);
	});

};

;(function() {
	jsPlumb.ready(onReady);

})();

//http://jsplumbtoolkit.com/statemachine/demo-jquery.js