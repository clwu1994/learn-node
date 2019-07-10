const crypto = require('crypto');
// 将值通过私钥签名，由.分割原值和签名
var sign = function(val, secret) {
  return val + '.' + crypto
    .createHmac('sha256', secret)
    .update(val)
    .digest('base64')
    .replace(/\=+$/, '');
}

// 在相应时，设置session值到Cookie中或者跳转URL
// var val = sign(req.sessionID, secret);
// res.setHeader('Set-Cookie', cookie.serialize(key, val));

// 接受请求时，检查签名
var unsign = function(val, secret) {
  var str = val.slice(0, val.lastIndexOf('.'));
  return sign(str, secret) === val ? str : false;
}