/* jshint esversion: 6 */
var express = require('express');
var router = express.Router();
var mysqlConn = require('../connections/mysql-conn');
var sql = "";

router.get('/:artist', function(req, res) {
  sql = "SELECT * FROM artist WHERE artist_id=" + req.params.artist;

  mysqlConn.query(sql, function(err, rows, fields) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error querying artist with id: " + req.params.artist + "."});
    }
    else{
      if(rows.length === 0){
        res.status(404)
            .json({"status": 404, "msg": "No artist with id: " + req.params.artist + " found."});
      }
      else{
        res.json(rows[0]);
      }
    }
  });
});

router.get('/songs/:artist', function(req, res) {
  sql = "SELECT * FROM song WHERE artist_id=" + req.params.artist;

  mysqlConn.query(sql, function(err, rows, fields) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error querying songs of artist(" + req.params.artist + ")", "detailed_msg": err.message});
    }
    else{
      if(rows.length === 0){
        res.status(404)
            .json({"status": 404, "msg": "No songs found with artist(" + req.params.artist + ")"});
      }
      else{
        res.json(rows);
      }
    }
  });
});

router.get('/search/:txt', function(req, res) {
  sql = "SELECT * FROM artist WHERE name LIKE '%" + req.params.txt + "%'";

  mysqlConn.query(sql, function(err, rows, fields) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error querying artist by search", "detailed_msg": err.message});
    }
    else{
      if(rows.length === 0){
        res.status(404)
            .json({"status": 404, "msg": "No artists with searchpattern '" + req.params.txt + "'."});
      }
      else{
        res.json(rows);
      }
    }
  });
});

module.exports = router;
