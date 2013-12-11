var mysql = require('mysql');
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
var postData = '';
/* If the node mysql module is not found on your system, you may
 * need to do an "sudo npm install -g mysql". */

/* You'll need to fill the following out with your mysql username and password.
 * database: "chat" specifies that we're using the database called
 * "chat", which we created by running schema.sql.*/
var dbConnection = mysql.createConnection({
  host: 'localhost',
  user: "root",
  password: "",
  database: "chat"
});

/* Now you can make queries to the Mysql database using the
 * dbConnection.query() method.
 * See https://github.com/felixge/node-mysql for more details about
 * using this module.*/

/* You already know how to create an http server from the previous
 * assignment; you can re-use most of that code here. */
dbConnection.connect();
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
    dbConnection.query('select * from messages', function(err, rows, fields) {
      if (err) throw err;
      chatMessages = rows;
    });
    request.on('data', function(datum) {
      postData += datum;
      if (requestMethod === 'POST') {
        statusCode = 201;
        console.log(postData);
        var username = postData.username;
        var message = postData.text;
        dbConnection.query('insert into messages (username, message) values ("' + username + '", "' + message +'"' , function(err, rows, fields) {
          if (err) throw err;
        });
        //insert a message into chatMessages table
        // var stream = fs.createWriteStream("data.txt");
        // stream.once('open', function(fd) {
        //   chatMessages.push(JSON.parse(postData))
        //   stream.write(JSON.stringify(chatMessages));
        //   stream.end();
        // });
      }

    });
    request.on('end', function() {
    });
    headers['Content-Type'] = "text/plain";
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(chatMessages));
  } else if (urlParse.pathname === "/") {
    fs.readFile('client/index.html', function (err, html) {
      if (err) {
          throw err;
      }
      headers['Content-Type'] = 'text/html';
      response.writeHeader(200, headers);  // <-- HERE!
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

