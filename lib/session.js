const session = {};
const key = "session_id";
const EXPIRES = 20 * 60 * 1000;
function generate() {
  session.id = new Data().getTime() + Math.random();
  session.cookie = {
    expire: new Date().getTime() + EXPIRES
  };
  session[session.id] = session;
  return session;
}


exports.setSession = function(req, res) {
  const id = req.cookies[key];
  if (!id) {
    req.session = generate();
  } else {
    const session = session[id];
    if (session) {
      if (session.cookie.expire > new Date().getTime()) {
        // 更新超时时间
        session.cookie.expire = new Date().getTime() + EXPIRES;
        req.session = session;
      } else {
        // 超时了，删除旧的数据，并重新生成
        delete session[id];
        req.session = generate();
      }
    } else {
      // 如果session过期或口令不对，重新生成session
      req.session = generate();
    }
  }
};

exports.generate = generate;
exports.EXPIRES = EXPIRES;