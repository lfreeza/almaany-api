var qs   = require('querystring');
var fs   = require('fs');
var pathview = require('path');

var level = require('level');
var db = level(__dirname + '/db');

var jwt  = require('jsonwebtoken');
var secret = process.env.JWT_SECRET || "ini rahasia"; // super secret



// generate a GUID
function generateGUID() {
    return new Date().getTime(); 
  }

  function generateToken(req, GUID, opts) {
    opts = opts || {};
  
    // By default, expire the token after 7 days.
    // NOTE: the value for 'exp' needs to be in seconds since
    // the epoch as per the spec!
    var expiresDefault = '7d';
  
    var token = jwt.sign({
      auth:  GUID,
      agent: req.headers['user-agent']
    }, secret, { expiresIn: opts.expires || expiresDefault });
  
    return token;
  }

  function generateAndStoreToken(req, opts) {
    var GUID   = generateGUID(); // write/use a better GUID generator in practice
    var token  = generateToken(req, GUID, opts);
    var record = {
      "valid" : true,
      "created" : new Date().getTime()
    };
  
    db.put(GUID, JSON.stringify(record), function (err) {
      // console.log("record saved ", record);
    });
  
    return token;
  }

 



function loadView(view) {
    var filepath = pathview.resolve(__dirname, view + '.html');
  return fs.readFileSync(filepath).toString();
}

// Content
var index      = loadView('index');
var auth       = loadView('auth');      // default page
  // auth fail

function home(res) {
  res.writeHead(200, {'content-type': 'text/html'});
  return res.end(index);
}

function authenticate(res) {
  res.writeHead(200, {'content-type': 'text/html'});
  return res.end(auth);
}

function verify(token) {
  var decoded = false;
  try {
    decoded = jwt.verify(token, secret);
  } catch (e) {
    decoded = false; // still false
  }
  return decoded;
}

var app = loadView('app'); 
var fail       = loadView('fail');

function authSuccess( res) {

  res.writeHead(200, {
    'content-type': 'text/html',
  });
  return res.end(app);
}


// show fail page (login)
function authFail(res, callback) {
  res.writeHead(401, {'content-type': 'text/html'});
  return res.end(fail);
}

function authHandler(req, res){
  if (req.method === 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    }).on('end', function () {
      var post = qs.parse(body);
      if(verify(post.token)) {
        console.log('Success');
        authSuccess(res);
      } else {
        console.log('failed');
        authFail(res);
      }
    });
  } else {
    console.log('failed');
    authFail(res);
  } 
}








module.exports = {
  
  home: home,
  authenticate: authenticate,
  generateAndStoreToken: generateAndStoreToken,
  loadView:loadView,
  authHandler: authHandler,
  verify: verify,
  authSuccess: authSuccess,
  authFail: authFail
  
}
