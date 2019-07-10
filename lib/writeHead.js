const serialize = require('serialize');
const key = "session_id";
function writeHead(res) {
  const writeHead = res.writeHead;
  res.writeHead = function() {
    let cookies = res.getHeader('Set-Cookie');
    const session = serialize(key, req.session.id);
    cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session]
    res.setHeader('Set-Cookie', cookies);
    return writeHead.apply(this, arguments);
  }
}
module.exports = writeHead;