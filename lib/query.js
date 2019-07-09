function query(req, res) {
  req.query = url.parse(req.url).query;
}
module.exports = query;