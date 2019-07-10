const serialize = require('serialize');
const key = "session_id";
function writeHead(res) {
  const writeHead = res.writeHead;
  res.writeHead = function() {
    let cookies = res.getHeader('Set-Cookie');
    const session = serialize(key, req.session.id);
    cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session]
    res.setHeader('Set-Cookie', cookies);
    // 保存回缓存
    // store.save(req.session);
    return writeHead.apply(this, arguments);
  }
}
module.exports = writeHead;