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