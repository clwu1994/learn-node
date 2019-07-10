const { generate, EXPIRES } = require("./session");
function cacheSession(req, res) {
  var id = req.cookies[key];
  if (!id) {
    req.session = generate();
    // 业务代码
  } else {
    store.get(id, function(err, session) {
      if (session) {
        if (session.cookie.expire > new Date().getTime()) {
          // 更新超时时间
          session.cookie.expire = new Date().getTime() + EXPIRES;
          req.session = session;
        } else {
          // 超时了，删除旧的数据，并重新生成
          delete sessions[id];
          req.session = generate();
        }
      } else {
        // 如果session过期或口令不对，重新生成session
        req.session = generate();
      }
      // 业务代码
    });
  }
}
