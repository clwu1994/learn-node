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
- Cookie
  1. 初始Cookie
  因为HTTP是无状态协议，现实中的业务却需要一定的状态，否则无法区分用户之间的身份。如何标识和认证一个用户，最早的方案就是Cookie了。
    Cookie的处理分为如下几步：
    - 服务器向客户端发送Cookie
    - 浏览器将Cookie保存
    - 之后每次浏览器都会将Cookie发向服务器端
  HTTP_Parser会将所有报文字段解析到req.headers上，那么Cookie就是req.headers.cookie。根据规范中的定义，Cookie值的格式是Key=value; key2=value2形式的，如果我们需要Cookie，解析它也十分容易。