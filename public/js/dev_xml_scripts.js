
var startID = 1;
var nodeID = 1;
var branchID = 1;
var endID = 1;
var decideID = 1;
var resultID = 1;

var socket = null;

var scriptsName = null;
var scriptsTree = {};

var Node = function(){
	this.lines = "";
	this.id = null;
	this.type = "";
	this.children = {};
	this.parents = {};
	this.addChild = function(child){
		this.children[child.id] = child;
	};
	this.removeChildById = function(id){
		delete this.children[id];
	};
	this.getChildById = function(id){
		return this.children[id];
	};
	this.addParent = function(parent){
		this.parents[parent.id] = parent;
	};
	this.removeParentById = function(id){
		delete this.parents[id];
	};
	this.getParentById = function(id){
		return this.parents[id];
	};
};

var nodes = new Node();
var connections = {};

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
			alert("已到达最大连接数(" + info.maxConnections + ")，无法添加更多连接");
		}
	};
	return type;
};

var makeElement = function(jquery_element){
	jsPlumb.draggable(jquery_element);
	if(jquery_element[0].id.indexOf("end")<0){
		var sourcetype = sourceType();
		if(jquery_element[0].id.indexOf("branch") >= 0 || jquery_element[0].id.indexOf("decide") >= 0)
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

var bindClickEvent = function(element, node){
	element.bind("click", function(){
		if(!$(this).find('#textarea')[0]){
			var origintext = $(this).html().substring(0,$(this).html().indexOf('<'));
			$(this).html('<textarea id="textarea" style="z-index: 5; width:100%"></textarea><div class="ep"></div>');
			var textarea = $(this).find('#textarea');
			var parent = $(this);
			textarea[0].onblur = function(){
				var text = textarea[0].value;
				if(!text || antiJSInjection(text))
					text = origintext;
				node.lines = text;
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
		drop: dropFunction
	});
	$("#sidebar").droppable({
		drop: function(event, ui){
			if(ui.draggable[0].id.indexOf("clone") < 0){
				var node = nodes.getChildById(ui.draggable[0].id);
				for(var uid in node.parents){
					jsPlumb.detach(connections[node.parents[uid].id+node.id]);
					delete connections[node.parents[uid].id+node.id];
				}
				for(var uid in node.children){
					jsPlumb.detach(connections[node.id+node.children[uid].id]);
					delete connections[node.id+node.children[uid].id];
				}
				nodes.removeChildById(node.id);
				ui.draggable.remove();
			}
		}
	});
	jsPlumb.bind("click",function(c) {
		jsPlumb.detach(c);
		var source = nodes.getChildById(c.sourceId);
		var target = nodes.getChildById(c.targetId);
		source.removeChildById(c.targetId);
		target.removeParentById(c.sourceId);
		delete connections[c.sourceId+c.targetId];
	});
	jsPlumb.bind("connection", function(info){
		console.log(info);
		var sts1 = info.connection.sourceId.indexOf("branch") >= 0 
					|| info.connection.sourceId.indexOf("decide") >= 0
					|| info.connection.sourceId.indexOf("result") >= 0;
		var sts2 = info.connection.targetId.indexOf("branch") >= 0 
					|| info.connection.targetId.indexOf("decide") >= 0
					|| info.connection.targetId.indexOf("result") >= 0;
		var statement = (sts1 || sts2) && !(sts1 && sts2);
		if(statement){
			info.connection.getOverlay("label").setLabel("");
			var source = nodes.getChildById(info.connection.sourceId);
			var target = nodes.getChildById(info.connection.targetId);
			source.addChild(target);
			target.addParent(source);
			connections[source.id+target.id] = info.connection;
		}
		else{
			jsPlumb.detach(info.connection);
		}
	});

};

var dropFunction = function(event, ui){
	var savednode = ui.savednode?ui.savednode : {
		lines : "",
		id : ""
	};
	switch(ui.draggable[0].id){
	case "start_clone":
		var lines = savednode.lines?savednode.lines : '新入口'+startID;
		var id = savednode.id?savednode.id : "start-"+startID;
		$("#plumbContainer").append('<div class="start w"'+
					   'id="'+id+'" '+
					   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
					   '>'+lines+'<div class="ep"></div></div>');
		var ep_start = new Node();
		ep_start.id = id;
		ep_start.type = "start";
		ep_start.lines = lines;
		scriptsTree[ep_start.id] = ep_start;
		nodes.addChild(ep_start);
		makeElement($("#"+ep_start.id));
		bindClickEvent($("#"+ep_start.id), ep_start);
		startID++;
		break;
	case "node_clone":
		var lines = savednode.lines?savednode.lines : '新节点'+nodeID;
		var id = savednode.id?savednode.id : "node-"+nodeID
		$("#plumbContainer").append('<div class="node w"'+
					   'id="'+id+'" '+
					   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
					   '>'+lines+'<div class="ep"></div></div>');
		var ep_node = new Node();
		ep_node.id = id;
		ep_node.type = "node";
		ep_node.lines = lines;
		nodes.addChild(ep_node);
		makeElement($("#"+ep_node.id));
		bindClickEvent($("#"+ep_node.id), ep_node);
		if (!ui.savednode)
			nodeID++;
		break;
	case "branch_clone":
		var lines = savednode.lines?savednode.lines : '新分支'+branchID;
		var id = savednode.id?savednode.id : "branch-"+branchID
		$("#plumbContainer").append('<div class="branch w"'+
					   'id="'+id+'" '+
					   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
					   '>'+lines+'<div class="ep"></div></div>');
		var ep_branch = new Node();
		ep_branch.id = id;
		ep_branch.type = "branch";
		ep_branch.lines = lines;
		nodes.addChild(ep_branch);
		makeElement($("#"+ep_branch.id));
		bindClickEvent($("#"+ep_branch.id), ep_branch);
		branchID++;
		break;
	case "decide_clone":
		var lines = savednode.lines ? savednode.lines : '新决策点'+decideID;
		var id = savednode.id ? savednode.id : "decide-"+decideID;
		$("#plumbContainer").append('<div class="decide w"'+
					   'id="'+id+'" '+
					   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
					   '>'+lines+'<div class="ep"></div></div>');
		var ep_decide = new Node();
		ep_decide.id = id;
		ep_decide.type = "decide";
		ep_decide.lines = lines;
		nodes.addChild(ep_decide);
		makeElement($("#"+ep_decide.id));
		bindClickEvent($("#"+ep_decide.id),ep_decide);
		decideID++;
		break;
	case "result_clone":
		var lines = savednode.lines ? savednode.lines : '新决策结果点'+resultID;
		var id = savednode.id ? savednode.id : "result-"+resultID;
		$("#plumbContainer").append('<div class="result w"'+
					   'id="'+id+'" '+
					   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
					   '>'+lines+'<div class="ep"></div></div>');
		var ep_result = new Node();
		ep_result.id = id;
		ep_result.type = "result";
		ep_result.lines = lines;
		nodes.addChild(ep_result);
		makeElement($("#"+ep_result.id));
		bindClickEvent($("#"+ep_result.id),ep_result);
		resultID++;
		break;
	case "end_clone":
		var lines = savednode.lines?savednode.lines : '新结束点'+endID;
		var id = savednode.id?savednode.id : "end-"+endID
		$("#plumbContainer").append('<div class="end w"'+
					   'id="'+id+'" '+
					   'style="left: '+(ui.position.left-screen.width/10)+'px; top: '+ui.position.top+'px;"'+
					   '>'+lines+'<div class="ep"></div></div>');
		var ep_end = new Node();
		ep_end.id = id;
		ep_end.type = "end";
		ep_end.lines = lines;
		nodes.addChild(ep_end);
		makeElement($("#"+ep_end.id));
		bindClickEvent($("#"+ep_end.id), ep_end);
		endID++;
		break;
	}
}

var LoadPlay = function(data){
	console.log('onLoadPlay');
	if(!data){
		alert('没有找到该剧本');
		return;
	}
	$("#plumbContainer").html("");
	startID = 1;
	nodeID = 1;
	branchID = 1;
	endID = 1;
	decideID = 1;
	resultID = 1;

	scriptsName = data.name;
	$("#name").html(scriptsName+'<a id="changeName">修改</a>');
	$("#changeName").click(onChangeName);
	scriptsTree = {};
	
	for (var uid in data.node){
		var ui = {
			draggable : [{id: data.node[uid].type[0]+"_clone"}],
			position : { 
				left : data.node[uid].left[0], 
				top : data.node[uid].top[0]
			},
			savednode : {
				lines : data.node[uid].lines[0],
				id : data.node[uid].id[0],
				type : data.node[uid].type[0]
			}
		}
		dropFunction(null,ui);
	};
	for (var uid in data.connection){
		jsPlumb.connect({
			source : data.connection[uid].sourceId[0],
			target : data.connection[uid].targetId[0]
		});
	};
};

var onLoad = function(){
	socket.emit('onload',$('#loadInput')[0].value);
}
var onSave = function(){
	if(scriptsName === null){
		//alert("请给你的剧本一个名字");
		$("#name").css("color", "red");
		setTimeout(function(){
			$("#name").css("color", "inherit");
		},2000);
		return;
	}
	var data = {
		nodes : {},
		connections : {}
	};
	for(var uid in nodes.children){
		data.nodes[uid] = {};
		data.nodes[uid].id = nodes.children[uid].id;
		data.nodes[uid].type = nodes.children[uid].type;
		data.nodes[uid].lines = nodes.children[uid].lines;
		data.nodes[uid].top = $("#"+data.nodes[uid].id)[0].offsetTop;
		data.nodes[uid].left = $("#"+data.nodes[uid].id)[0].offsetLeft+screen.width/10;		
	}
	for(var uid in connections){
		data.connections[uid] = {};
		data.connections[uid].sourceId = connections[uid].sourceId;
		data.connections[uid].targetId = connections[uid].targetId;
	}
	data.name = scriptsName;
	socket.emit("onsave", data);
};

var onChangeName = function(){
	var name = $("#name");
	var oldtext = name.html();
	oldtext = oldtext.substring(0,oldtext.indexOf('<a id="changeName">修改</a>'));
	name.html('<input type="text" id="nameInput">');
	$("#nameInput").keypress(function(event){
		var keynum = null;
		if(window.event) // IE
			keynum = event.keyCode
		else if(event.which) // Netscape/Firefox/Opera
			keynum = event.which
		if(keynum == 13){
			value = $(this)[0].value;
			if(value){
				if(antiJSInjection(value)){
					value = oldtext;
					alert("Warning! DO NOT try to do something bad!");
				}
				scriptsName = value;
				name.html(value+'<a id="changeName">修改</a>');
			}
			else
				name.html(oldtext+'<a id="changeName">修改</a>');
			$("#changeName").click(onChangeName);
		}
	});
	$("#nameInput").blur(function(){
		value = $(this)[0].value;
		if(value){
			if(antiJSInjection(value)){
				value = oldtext;
				alert("Warning! DO NOT try to do something bad!");
			}
			scriptsName = value;
			name.html(value+'<a id="changeName">修改</a>');
		}
		else
			name.html(oldtext+'<a id="changeName">修改</a>');
		$("#changeName").click(onChangeName);
	});
	$("#nameInput")[0].value = oldtext;
	$("#nameInput").focus();
};

;(function() {
	socket = io.connect('/scripts');

	socket.on("echosave", function(data){
		console.log(data);
		var time = (new Date()).toLocaleTimeString();
		$("#time").html("上次保存于："+time);
	});

	socket.on('error', function(err){
		alert(err);
	})

	socket.on('load',function(data){
		LoadPlay(data);
	});

	jsPlumb.ready(onReady);
	var time = (new Date()).toLocaleTimeString();
	$("#time").html("创建于："+time);
	$("#changeName").click(onChangeName);
	$("#save").click(onSave);
	$("#load").click(onLoad);
})();
