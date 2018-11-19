var port = process.env.PORT || 8888; // let heroku define port or use 1337
var http = require('http');          // core node.js http (no frameworks)
var url = require('url');            // core node.js url (no frameworks)
var app  = require('./helpers'); // auth, token verification & render helpers
var ejs = require('ejs');

http.createServer(function (req, res) {
  var path = url.parse(req.url).pathname;
  if( path === '/' || path === '/home' ) { app.home(res);           } // homepage
  else if (path === '/gettoken'){
    var token = app.generateAndStoreToken(req);
    console.log(token);
    res.writeHead(200, {'content-type': 'text/html'});
    var renderedHtml = ejs.render(app.loadView('index'), {token: token});
    res.end(renderedHtml);
  }
  else if (path === '/auth'){
    app.authenticate(res);
  }
  else if (path === '/verify'){
    app.authHandler(req, res);
  }
}).listen(port);

console.log("Visit: http://127.0.0.1:" + port);
