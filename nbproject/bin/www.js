#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../webserver');
var http = require('http');

app.listen(3000, function(){
    console.log('Listening on Port 3000');
});
