'use strict';

// Require Express module
var express = require('express');

// Storing Express module in variable as a function
var app = express();

// Serve all asset files from necessary directories
app.use(express.static(__dirname + '/public'));
app.use("/scripts", express.static(__dirname + "/public/scripts"));
app.use("/styles", express.static(__dirname + "/public/styles"));
app.use("/views", express.static(__dirname + "/public/views"));

// Serve index.html for all remaining routes, in order to leave routing up to Angular
app.get('/*', function(req, res) { 
  res.sendFile(__dirname + '/public/index.html');
});

// Listen to port 1337 if not set by environment
app.listen(process.env.PORT || 1337, process.env.IP, function() {
  console.log('GiphyApp server listening on port 1337');
});