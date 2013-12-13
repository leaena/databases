var Sequelize = require("sequelize");
var sequelize = new Sequelize("chat", "root", "plantlife");
var url = require('url');
var http = require("http");
var fs = require('fs');
var path = require('path');
var port = 8080;
var ip = "127.0.0.1";
var mime = {
  ".js" : 'text/javascript',
  ".css" : 'text/css'
};
var chatMessages = [];
var userData = {};
var postData = '';
var settingData = '';
var message = sequelize.define('message', {
  username: Sequelize.STRING,
  message: Sequelize.STRING
});
var Users = sequelize.define('Users', {
  username: Sequelize.STRING,
  textcolor: Sequelize.STRING,
  font: Sequelize.STRING,
  signOff: Sequelize.STRING
});

message.sync().success(function() {
  /* This callback function is called once sync succeeds. */

  // now instantiate an object and save it:
});

Users.sync();


http.createServer(
  function(request, response) {
  var headers = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "access-control-max-age": 10 // Seconds.
  };
  var statusCode = 200;
  var urlParse = url.parse(request.url);
  var requestMethod = request.method;

  if (urlParse.pathname.indexOf('/classes') !== -1){
  message
    .findAll({}, {raw: true, plain: false})
    .success(function(results) {
      chatMessages = results;
    });
    request.on('data', function(datum) {
      postData += datum;
      if (requestMethod === 'POST') {
        statusCode = 201;
        postData = JSON.parse(postData);
        var user = postData.username;
        var text = postData.text;
        var newUser = message.build({username: user, message: text});
        newUser.save();
      }

    });
    request.on('end', function() {
    });
    headers['Content-Type'] = "text/plain";
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(chatMessages));
  } else if (urlParse.pathname.indexOf('/users') !== -1){

    var paths = urlParse.pathname.split('/');
    
    var user = paths[2];
  Users
    .find({username: user}, {raw: true, plain: false})
    .success(function(results) {
      userData = results;
    });
    request.on('data', function(datum) {
      settingData += datum;
      settingData = JSON.parse(settingData);
      var newUser = Users.build(settingData);
      newUser.save();
      // if (requestMethod === 'POST') {
      //   statusCode = 201;
      //   console.log(userData);
      //   userData = JSON.parse(userData);
      //   var newUser = Users.build(userData);
      //   newUser.save();
      // }

    });
    request.on('end', function() {
    });
    headers['Content-Type'] = "text/plain";
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(userData));
  } else if (urlParse.pathname === "/") {
    fs.readFile('client/index.html', function (err, html) {
      if (err) {
          throw err;
      }
      headers['Content-Type'] = 'text/html';
      response.writeHeader(200, headers);
      response.write(html);
      response.end();
    });
  } else {
    var contentType = mime[path.extname(urlParse.pathname)];
    fs.readFile('client/' + urlParse.pathname, function (err, html) {
      if (err) {
          throw err;
      }
      headers['Content-Type'] = contentType;
      response.writeHeader(200, headers);
      response.write(html);
      response.end();
    });
  }
}
).listen(port, ip);

