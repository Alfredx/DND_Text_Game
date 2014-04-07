var crypto = require('crypto');

var checkSignature = function(req){
	arr[0] = 'alfredwechattoken';
	arr[1] = req.query.nonce;
	arr[2] = req.query.timestamp;
	arr.sort();
	var shasum = crypto.createHash('sha1');
	shasum.update(arr.join(''));
	if(shasum.digest('hex') == req.query.signature){
		return true;
	}
	else
		return false;
}