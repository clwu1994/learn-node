/**
 * /controller/action/a/b/c
 * @param {*} req 
 * @param {*} res 
 */
const handles = {};
function router(req, res) {
  const pathname = url.parse(req.url).pathname;
  const [controller = 'index', action = 'index', ...args] = pathname.split('/');
  if (handles[controller] && handles[controller][action]) {
    handles[controller][action].apply(null, [req, res].concat(args));
  } else {
    res.writeHead(500);
    res.end('找不到响应控制器');
  }
}
// 业务代码
// handles.index = {}
// handles.index.index = function(req, res, foo, bar) {
//   res.writeHead(200);
//   res.end(foo);
// }