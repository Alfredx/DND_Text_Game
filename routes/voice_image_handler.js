exports.render = function(req, res){
	var context = {
		title: "To my love"
	};
	res.render('forever',context);
}