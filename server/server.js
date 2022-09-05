'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var sslConfig  = require('./ssl-config.js');

var http = require('http');
var https = require('https');
var app = module.exports = loopback();
var app1 = module.exports = loopback();

app1.start = function() {
  // start the web server
  return app1.listen(function() {
    app1.emit('started');
    // var baseUrl = app1.get('url').replace(/\/$/, '');
    var baseUrl = 'http://localhost:' + app.get('port');
    console.log(baseUrl);
    console.log('Web server listening at: %s', baseUrl);
    if (app1.get('loopback-component-explorer')) {
      var explorerPath = app1.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

app.start = function(httpOnly) {
  
  if (httpOnly === undefined) {
    httpOnly = process.env.HTTP;
  }
  var server = null;
 if (!httpOnly) {
    var options = {
      key: sslConfig.privateKey,
      cert: sslConfig.certificate,     
    };
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }
  server.listen(app.get('https-port'), function() {
    var baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + 
app.get('https-port');
    app.emit('started', baseUrl);
    console.log('LoopBack server listening @ %s%s', baseUrl, '/');
    if (app.get('loopback-component-explorer')) {
     var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  return server;
};

boot(app1, __dirname, function(err) {
  if (err) throw err;

 
  if (require.main === module)
    app1.start();
    // app.start()
});
boot(app, __dirname, function(err) {
  if (err) throw err;

 
  if (require.main === module)
    app.start();
    // app.start()
});
