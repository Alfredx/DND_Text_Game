var crypto = require('crypto');

var checkSignature = function(req){
	var arr = new Array();
	arr[0] = 'alfredwechattoken';
	arr[1] = req.query.nonce;
	arr[2] = req.query.timestamp;
	arr.sort();
	var shasum = crypto.createHash('sha1');
	shasum.update(arr.join(''));
	if(shasum.digest('hex') == req.query.signature){
		return true;
	}
	else{
		return false;
	}
}

exports.render = function(req, res) {
	if (checkSignature(req)) {
		res.send(200, req.query.echostr);
	};
};
