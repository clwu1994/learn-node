- 8.1 基础功能
  - 请求方法的判断
  - URL的路径解析
  - URL中的查询字符串解析
  - Cookie的解析
  - Basic认证
  - 表单数据的解析
  - 任意格式文件的上传处理

- 8.1.1 请求方法
HTTP-Parser 请求方法存在于报文的第一行的第一个单词，通常是大写。在解析请求报文的时候，将报文头抽取出来，设置为req.method。
- 8.1.2 路径解析
HTTP-Parser 路径的部分存在于报文的第一行的第二部分，如下所示:
GET /path?foo=bar HTTP/1.1
- 8.1.3 查询字符串
  - 查询字符串位于路径之后，在地址栏中路径后的?foo=bar&baz=val字符串就是查询字符串
  - 这个字符串会跟随在路径后，形成请求报文首行的第二部分。这部分内容经常需要为业务逻辑所用，Node提供了queryString模块用于处理这部分数据，如下所示：
  
  ```
  var url = require('url');
  var queryString = require('queryString');
  var query = queryString.parse(url.parse(req.url).query);
  或者
  var query = url.parse(req.url, true).query
  {
    foo: 'bar',
    baz: 'val'
  }
  ```
- 8.1.4 Cookie
  1. 初始Cookie
  因为HTTP是无状态协议，现实中的业务却需要一定的状态，否则无法区分用户之间的身份。如何标识和认证一个用户，最早的方案就是Cookie了。
    Cookie的处理分为如下几步：
    - 服务器向客户端发送Cookie
    - 浏览器将Cookie保存
    - 之后每次浏览器都会将Cookie发向服务器端
  HTTP_Parser会将所有报文字段解析到req.headers上，那么Cookie就是req.headers.cookie。根据规范中的定义，Cookie值的格式是Key=value; key2=value2形式的，如果我们需要Cookie，解析它也十分容易。
  服务端告知客户端的方式是通过响应报文实现的，响应的Cookie值在Set-Cookie字段中。它的格式与请求中的格式不太相同，规范中对它的定义如下所示：
  Set-Cookie: name=value; Path=/; Expires=Sun, 23-Apr-23 09:01:35 GMT; Domain=.domain.com;
  其中name=value是必须包含的部分，其余部分解释可选参数。这些可选参数将会影响浏览器在后续将Cookie发送给服务端的行为。以下为主要的几个选项。
  - path表示这个Cookie影响到的路径，当前访问的路径不满足该匹配时，浏览器则不发送这个Cookie。
  - Expires和Max-Age是用来告知浏览器这个Cookie何时过期的，如果不设置该选项，在关闭浏览器时会丢失掉这个Cookie。如果设置了过期时间，浏览器将会把Cookie内容写入到磁盘中并保存，下次打开浏览器依旧有效。Expires的值是一个UTC格式的时间字符串，告知浏览器此Cookie何时将过期，Max-Age则告知浏览器此Cookie多久后过期。前者一般而言不存在问题，但是如果服务器端的时间和客户端的时间不能匹配，这种时间设置就会存在偏差。为此，Max-Age告知浏览器这条Cookie多久之后过期，而不是一个具体的时间点。
  - HttpOnly告知浏览器不允许通过脚本document.cookie去更改这个Cookie值，事实上，设置HttpOnly之后，这个值在document.cookie中不可见。但在HTTP请求的过程中，依然会发送这个Cookie到服务器端。
  - Secure。当Secure值为true时，在HTTP中是无效的，在HTTPS中才有效，表示创建的Cookie只能在HTTPS连接中被浏览器传递到服务器端进行会话验证，如果是HTTP连接则不会传递该信息，所以很难被窃听到。

  2. Cookie的性能影响
  由于Cookie的实现机制，一旦服务器端向客户端发送了设置设置Cookie的意图，除非Cookie过期，否则客户端每次请求都会发送这些Cookie到服务器端，一旦设置的Cookie过多，将会导致报头较大。大多数的Cookie并不需要每次都用上，因为这会造成带宽的部分浪费。
  - 减小Cookie的大小
  - 为静态组件使用不同的域名
  - 减少DNS查询
- 8.1.5 Session
  为了解决Cookie敏感数据的问题，Session应用而生。Session的数据只保留在服务器端，客户端无法修改，这样数据的安全性得到一定的保障，数据也无需在协议中每次每次都被传递。
  - 第一种：基于Cookie来实现用户和数据的映射
  - 第二种：通过查询字符串来实现浏览器端和服务器端数据的对应

  1. Session与内存
  为了解决性能问题和Session数据无法跨进程共享的问题，常用的方案是将Session集中化，将原本可能分散在多个进程里的数据，统一转移到集中的数据存储中。目前常用的工具是Redis、Memcached等。
  采用高速缓存的理由：
  - Node与缓存服务保持长连接，而非频繁的短连接，握手导致的延迟只影响初始化。
  - 高速缓存直接在内存中进行数据存储和访问。
  - 缓存服务通常与Node进程运行在相同的机器上或者相同的机房里，网络速度受到的影响较小。
  
  8.1.6 缓存
  为了提高性能，YSlow中也提到几条关于缓存的规则。
  - 添加Expires或Cache-Control到报文头中。
  - 配置ETags。
  - 让Ajax可缓存。
  如何让浏览器缓存我们的静态资源，这也是需要由服务器与浏览器共同协作完成的事情。通常来说，PUT、DELETE、PUT这类带行为性的请求操作一般不做任何缓存，大多数缓存只应用在GET请求中。
  缓存使用时间戳方式存在缺陷：
  - 文件的时间戳改动但内容并不一定改动。
  - 时间戳只能精确到秒级别，更新频繁的内容将无法生效。
  为此HTTP1.1中引入了ETag来解决这个问题。ETag的全称是Entity Tag，由服务器端生成，服务器端可以决定它的生成规则。如果根据文件内容生成散列值，那么条件请求将不会受到时间戳改动造成的带宽浪费。
  ```javascript
  var getHash = function(str) {
    var shasum = crypto.createHash('sha1');
    return shasum.update(str).digest('base64');
  }
  ```
  与If-Modified-Since/Last-Modified不同的是，ETag的请求和响应式If-None-Match/ETag，如下所示：
  ```javascript
  var handle = function(req, res) {
    fs.readFile(filename, function(err, file) {
      var hash = getHash(file);
      var noneMatch = req.headers['if-none-match'];
      if (hash === noneMatch) {
        res.writeHeader(304, 'Not Modified');
        res.end();
      } else {
        res.setHeader('ETag', hash);
        res.writeHead(200, 'ok');
        res.end(file);
      }
    })
  }
  ```
  HTTP1.0时，在服务器端设置Expires可以告知浏览器要缓存文件内容，如下代码所示：
  ```
  var handle = function(req, res) {
    fs.readFile(filename, function(err, file) {
      var expires = new Date();
      expires.setTime(expires.getTime() + 10*365*24*60*60*1000);
      res.setHeader('Expires', expires.toUTCString());
      res.writeHead(200, 'ok');
      res.end(file);
    })
  } 
  ```
  Expires是一个GMT格式的时间字符串。浏览器在接到这个过期值后，只要本地还存在这个缓存文件，在到期时间之前它都不会再发起请求。
  但是Expires的缺陷在于浏览器与服务器之间的时间可能不一致，这可能会带来一些问题，比如文件提前过期，或者到期后并没有被删除。在这种情况下，Cache-Control以更丰富的形式，实现相同的功能，如下所示：
  ```javascript
  var handle = function(req, res) {
    fs.readFile(filename, function(err, file) {
      res.setHeader('Cache-Control', 'max-age=' + 10*365*24*60*60*1000);
      res.writeHead(200, 'ok');
      res.end(file);
    })
  }
  ```
  上面Cache-Control设置了max-age值，比Expires优秀在于，Cache-Control能够避免浏览器端与服务器端时间不同步带来的不一致性问题，只要出现类似倒计时的方式计算过期时间即可。
  8.1.7 Basic认证
  请求报头中：
  > 
    \> GET / http/1.1 
    \> Authorization: Basic dxNlcjpwYXNz
  在Basic认证中，它会将用户名和密码部分组合：username + ':' + password。然后进行Base64编码，如下所示：
  ```javascript
  var encode = function(username, password) {
    return new Buffer(username + ':' + password).toString('base64');
  }
  ```
  如果用户首次访问该网页，URL地址中也没有携带认证内容，那么浏览器会响应一个401未授权的状态码，如下所示：
  ```javascript
  function(req, res) {
    var auth = req.header['authorization'] || '';
    var parts = auth.split(' ');
    var method = parts[0] || ''; // Basic
    var encoded = parts[1] || ''; // dxNlcjpwYXNz
    var decoded = new Buffer(encoded, 'base64').toString('utf-8').split(':');
    var user = decoded[0]; // user
    var pass = decoded[1]; // pass
    if (!checkUser(user, pass)) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
      res.writeHead(401);
      res.end();
    } else {
      handle(req, res);
    }
  }
  ```
  8.2 数据上传
  Node的http模块只对HTTP报文的头部进行了解析，然后触发request事件。如果请求中还带有内容部分（如POST请求，它具有报文和内容），
  内容部分需要用户自行接收和解析。通过报文的Transfer-Encoding或Content-Length即可判断请求中是否带有内容，如下所示：
  ```javascript
  var hasBody = function(req) {
    return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
  }
  ```
  在HTTP_Parser解析报文头结束后，报文内容部分会通过data事件触发，我们只需以流的方式处理即可，如下所示：
  ```javascript
  function(req, res) {
    if (hasBody(req)) {
      var buffers = [];
      req.on('data', function(chunk) {
        buffers.push(chunk);
      });
      req.on('end', function() {
        req.rawBody = Buffer.concat(buffers).toString();
        handle(req, res);
      })
    } else {
      handle(req, res);
    }
  }
  ```
  将接收到的Buffer列表转化为一个Buffer对象后，再转换为没有乱码的字符串，暂时挂置在req.rawBody处。
  8.2.1 表单数据
  ```html
  <form action="/upload" method="post">
    <label for="username">Username:</label>
    <input type="text" name="username" id="username"/>
    <br/>
    <input type="submit" name="submit" value="Submit" />
  </form>
  ```
  默认的表单提交，请求头中的Content-Type字段值为application/x-www-form-urlencoded，如下所示：
  Content-Type: application/x-www-form-urlencoded
  ```javascript
  var hanlde = function(req, res) {
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      res.body = queryString.parse(req.rawBody);
    }
    todo(req, res);
  }
  ```
  后续业务中直径访问req.body就可以得到表单中提交的数据
  8.2.2 其他格式
  ```javascript
  var mine = function(req) {
    var str = req.headers['content-type'] || '';
    return str.split(';')[0];
  }
  ```
  1.JSON文件
  如果从客户端提交JSON内容，这对于Node来说，要处理它不需要额外的任何库，如下所示：
  ```javascript
  var handle = function(req, res) {
    if (mine(req) === 'application/json') {
      try {
        req.body = JSON.parse(req.rawBody);
      } catch (e) {
        // 异常内容，响应Bad request，
        res.writeHead(400);
        res.end('Invalid JSON');
        return;
      }
    }
    todo(req, res);
  }
  ```
  2.XML文件
  解析XML文件，社区的xml2js模块支持XML文件转JSON对象
  ```javascript
  var xml2js = require('xml2js');
  var handle = function(req, res) {
    if (mime(req) === 'application/xml') {
      xml2js.parseString(req.rawBody, function(err, xml) {
        if (err) {
          // 异常内容，响应Bad request
          res.writeHead(400);
          res.end('Invalid XML');
          return;
        }
        req.body = xml;
        todo(req, res);
      })
    }
  }
  ```
  8.2.3 附件上传
  在前端HTML代码中，特殊表单与普通表单的差异在于该表单中可以含有file类型的控件，以及需要指定表单属性enctype为multipart/form-data，如下所示：
    ```html
  <form action="/upload" method="post">
    <label for="username">Username:</label><input type="text" name="username" id="username"/>
    <label for="username">Filename:</label><input type="file" name="file" id="file"/>
    <br/>
    <input type="submit" name="submit" value="Submit" />
  </form>
  ```
  浏览器在遇到multipart/form-data表单提交时，构造的请求报文与普通表单完全不同。
  Content-Type: multipart/form-data; boundary=AaB03x
  Content-Length: 18231
  由于是文件上传，接受大小未知的数据量时，我们需要十分谨慎。
  ```javascript
  function(req, res) {
    if (hasBody(req)) {
      var done = function() {
        handle(req, res);
      };
      if (mime(req) === 'application/json') {
        parseJSON(req, done);
      }
      else if (mime(req) === 'application/xml') {
        parseXML(req, done);
      }
      else if (mime(req) === 'multipart/form-data') {
        parseMultipart(req, done);
      }
    } else {
      handle(req, res);
    }
  }
  ```
  formidable模块基于流式处理解析报文，将接受到的文件写入到系统的临时文件中，并返回对应的路径，如下所示：
  ```javascript
  var formidable = require('formidable');
  function parseMultipart(req, res) {
    if (hasBody(req)) {
      if (mime(req) === 'multipart/form-data') {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
          req.body = fields;
          req.files = files;
          handle(req, res);
        })
      }
    } else {
      handle(req, res);
    }
  }
  ```