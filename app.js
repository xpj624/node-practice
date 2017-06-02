var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');

var app = express();

app.get('/', function(req, res, next) {
    // 用 superagent 去抓取 https://cnodejs.org/ 的内容
    superagent.get('https://cnodejs.org/')
        .end(function(err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是 jquery 的内容了
            var $ = cheerio.load(sres.text);
            var items = [];
            $('#topic_list .topic_title, #topic_list .user_avatar').each(function(idx, element) {
                var $element = $(element);
                var pos = items.length;
                if ($element.hasClass('pull-left')) {
                    items[pos] = {};
                    items[pos].user = $element.attr('href').slice(6);
                } else {
                    items[pos - 1].title = $element.attr('title');
                    items[pos - 1].href = $element.attr('href');
                }
                // items.push({
                //     title: $element.attr('title'),
                //     href: $element.attr('href')
                // });

            });
            console.log('把数据写入访问的页面');
            res.send(items); // 把数据写入访问的页面

            // 向result.json文件写入内容，先将对象转换为json字符串
            const buf = Buffer.alloc(1024);
            fs.writeFile('result.json', JSON.stringify(items), buf, function(err) {
                if (err) {
                    return console.error(err);
                }
                console.log('数据写入成功');
            });
        });
});

app.listen(3000, function(req, res) {
    console.log('app is running at port 3000');
});
