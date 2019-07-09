function handle() {}
function query(req, res) {
  req.query = url.parse(req.url).query;
  handle(req, res)
}