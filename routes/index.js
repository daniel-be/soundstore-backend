/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
var router = express.Router();

/*router.use(function timeLog(req, res, next) {
  var date = new Date();
  console.log('Time: ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
  next();
});*/

router.get('/', function(req, res){
    console.log(__dirname);
    res.sendFile('./views/index.html');
});

module.exports = router;
