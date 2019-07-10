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
  