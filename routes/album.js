/* jshint esversion: 6 */
var express = require('express');
var router = express.Router();
var mysqlConn = require('../connections/mysql-conn');
var sql = "";

router.get('/:album', function(req, res) {
  sql = `SELECT alb.album_id, alb.name, alb.duration, alb.song_count, alb.release, alb.img_url, alb.genre_id, alb.genre_id, alb.artist_id, a.name AS artist_name
        FROM album alb
        INNER JOIN artist a ON a.artist_id=alb.artist_id
        WHERE album_id=` + req.params.album;

  mysqlConn.query(sql, function(err, rows, fields) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error querying album", "detailed_msg": err.message});
    }
    else{
      if(rows.length === 0){
        res.status(404)
            .json({"status": 404, "msg": "No album with id: " + req.params.album + " found."});
      }
      else{
        res.json(rows[0]);
      }
    }
  });
});

router.get('/songs/:album', function(req, res) {
  sql = "SELECT * FROM song WHERE album_id=" + req.params.album;

  mysqlConn.query(sql, function(err, rows, fields) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error querying songs of album(" + req.params.album + ")", "detailed_msg": err.message});
    }
    else{
      if(rows.length === 0){
        res.status(404)
            .json({"status": 404, "msg": "No songs found with album(" + req.params.album + ")"});
      }
      else{
        res.json(rows);
      }
    }
  });
});

router.get('/search/:txt', function(req, res) {
  sql = "SELECT * FROM album WHERE name LIKE '%" + req.params.txt + "%'";

  mysqlConn.query(sql, function(err, rows, fields) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error querying album by search", "detailed_msg": err.message});
    }
    else{
      if(rows.length === 0){
        res.status(404)
            .json({"status": 404, "msg": "No albums with searchpattern '" + req.params.txt + "'."});
      }
      else{
        res.json(rows);
      }
    }
  });
});

router.get('/latest/:num', function(req, res){
    sql = `SELECT alb.album_id, alb.name, alb.duration, alb.song_count, alb.release, alb.img_url, alb.genre_id, alb.artist_id, a.name AS artist_name
          FROM album alb
          INNER JOIN artist a ON a.artist_id=alb.artist_id
          ORDER BY alb.create_time desc LIMIT ` + req.params.num;

    mysqlConn.query(sql, function(err, rows, fields){
        if(err){
            res.status(500)
                .json({"status": 500, "msg": "Error querying latest: " + req.params.num + " albums.", "detailed_msg": err.message});
        }
        else{
            if(rows.length > 0){
                res.json({
                    "status": 200,
                    "albums": rows
                });
            }
            else{
                res.status(404)
                    .json({"status": 404, "msg": "No albums found."});
            }
        }
    });
});

module.exports = router;
