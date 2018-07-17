var express = require('express'),
  fs = require('fs'),
  Url = require('url');

var app = express();

app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write("Welcome to WheelOfFortune");
  res.end();
});

app.use('/client', express.static('client'));

app.use('/Wheel', require('./javascripts/WheelOfFortune.js'));

app.listen(8080);
