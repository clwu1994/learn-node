const { generate } = require('generate')
const key = "session_id";
var getURL = function(_url, key, value) {
  var obj = url.parse(_url, true);
  obj.query[key] = value;
  return url.format(obj);
}

module.export = function(req, res) {
  let session = {};
  var redirect = function(url) {
    res.setHeader('Location', url);
    res.writeHead(302);
    res.end();
  }
  var id = req.query[key];
  if (!id) {
    session = generate();
    redirect(getURL(req.url, key, session.id));
  } else {
    session = session[id];
    if (session) {
      if (session.cookie.expire > (new Date()).getTime()) {
        // 更新超时时间
        session.cookie.expire = (new Date().getTime()) + EXPIRES;
        req.session = session;
      }
      else {
        // 超时了，删除旧的数据，并重新生成
        delete session[id];
        session = generate();
        redirect(getURL(req.url, key, session.id));
      }
    } else {
      // 如果session过期或口令不对，重新生成session
      session = generate();
      redirect(getURL(req.url, key, session.id));
    }
  }
}