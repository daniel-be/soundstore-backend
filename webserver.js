var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

var index = require('./routes/index');
var user = require('./routes/user');
var song = require('./routes/song');
var album = require('./routes/album');
var artist = require('./routes/artist');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/views')));
app.use(function (req, res, next) {
    var allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/', index);
app.use('/user', user);
app.use('/song', song);
app.use('/album', album);
app.use('/artist', artist);

module.exports = app;
