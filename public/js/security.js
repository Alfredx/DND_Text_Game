
var antiJSInjection = function(str){
	if(str.indexOf('<script') >= 0 || str.indexOf('</script') >= 0)
		return true;
	else
		return false;
};