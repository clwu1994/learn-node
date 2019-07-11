const filename = '';
function handle(req, res) {
  fs.stat(filename, function(err, stat) {
    const lastModified = stat.mtime.toUTCString();
    if (lastModified === req.headers['if-modified-since']) {
      res.writeHead(304, 'Not Modified');
      res.end();
    } else {
      fs.readFile(filename, function(err, file) {
        const lastModified = stat.mtime.toUTCString();
        res.setHeader("Last-Modified", lastModified);
        res.writeHead(200, "ok");
        res.end(file);
      })
    }
  })
}