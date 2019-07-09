function App() {
  return function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('hello world\n');
  }
}
module.exports = App;