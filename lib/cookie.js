function parseCookie(cookie) {
  const cookies = {};
  if (!cookie) {
    return cookies;
  }
  const list = cookie.split(';');
  for (var i = 0; i < list.length; i++) {
    const [key, value] = list[i].split('=')
    cookies[key.trim()] = value;
  }
  return cookies;
}

function cookie(req, res) {
  req.cookies = parseCookie(req.headers.cookie);
}
module.exports = cookie;