var qs   = require('querystring');
const rp = require('request-promise');
var fs   = require('fs');
var pathview = require('path');
var indoarab  = require('./indoarab');
const url= 'https://www.almaany.com/id/dict/ar-id/';

var jwt  = require('jsonwebtoken');
var secret = process.env.JWT_SECRET || "18216027"; 



// generate a GUID
function generateGUID() {
    return new Date().getTime(); 
  }

  function generateToken(req, GUID, opts) {
    opts = opts || {};
  
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


// show fail page
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

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

//Web Scraping
function webscrap(indo,res){
  rp(url)
  .then(function(html) {
      return indoarab('https://www.almaany.com/id/dict/ar-id/' + indo);
  })
  .then(function(kata) {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(kata));
  })
  .catch(function(err) {
    //handle erroring
    console.log(err);
  });
}

function api(req,res){
  //success!
  var indo = getParameterByName('indo', req.url);
  var token =  getParameterByName('token', req.url);

  if (verify(token)){
    webscrap(indo,res);
  }
  else{
    var error = {
      "Error": {
        "code": 401,
        "message": "Unauthorized Access, please insert a valid token"
      }
     };
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(error));
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
  authFail: authFail,
  api:api
  
}