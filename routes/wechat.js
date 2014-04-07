var wechat = require('wechat');
var List = wechat.List;
var crypto = require('crypto');
var wechatToken = 'alfredwechattoken';

var checkSignature = function(req){
	var arr = new Array();
	arr[0] = wechatToken;
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
};

List.add('listtest',[
	['reply {a} to see A',function(info,req,res){
		res.reply('AAAAAAA');
	}],
	['reply {b} to see B',function(info,req,res){
		res.reply('BBBBBBB');
	}],
	['reply {c} to see C',function(info,req,res){
		res.reply('CCCCCCC');
	}]
]);

exports.handler = wechat(wechatToken,wechat.text(function(info,req,res,next){
	res.wait('listtest');
}));


exports.render = function(req, res) {
	if (checkSignature(req)) {
		res.send(200, req.query.echostr);
	};
};
