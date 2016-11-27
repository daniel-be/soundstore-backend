/* jshint esversion: 6 */
var express = require('express');
var router = express.Router();
var mysqlConn = require('../connections/mysql-conn');
var sql = "";

router.get('/:songid', function(req, res){
    sql = `SELECT s.song_id, s.name, s.price, s.duration, s.release, s.album_id, s.artist_id, s.genre_id, alb.name AS album_name, alb.img_url AS album_img_url, a.name AS artist_name, g.name AS genre_name
          FROM song s
          INNER JOIN genre g ON g.genre_id=s.genre_id
          INNER JOIN artist a ON a.artist_id=s.artist_id
          INNER JOIN album alb ON alb.album_id=s.album_id
          WHERE s.song_id=` + req.params.songid;

    mysqlConn.query(sql, function(err, rows, fields){
        if(err){
            res.status(500)
                .json({"status": 500, "msg": "Error querying song data", "detailed_msg": err.message});
        }
        else{
            if(rows.length > 0){
                res.json({
                    "status": 200,
                    "song": rows[0]
                });
            }
            else{
                res.status(404)
                    .json({"status": 404, "msg": "Song(id: " + req.params.songid+ ") not found."});
            }
        }
    });
});

router.get('/album/:albumid', function(req, res){
    sql = `SELECT s.song_id, s.name, s.price, s.duration, s.release, s.album_id, s.artist_id, s.genre_id, alb.name AS album_name, alb.img_url AS album_img_url, a.name AS artist_name, g.name AS genre_name
          FROM song s
          INNER JOIN genre g ON g.genre_id=s.genre_id
          INNER JOIN artist a ON a.artist_id=s.artist_id
          INNER JOIN album alb ON alb.album_id=s.album_id
          WHERE s.album_id=` + req.params.albumid;

    mysqlConn.query(sql, function(err, rows, fields){
        if(err){
            res.status(500)
                .json({"status": 500, "msg": "Error querying albumsongs data", "detailed_msg": err.message});
        }
        else{
            if(rows.length > 0){
                res.json({
                    "status": 200,
                    "songs": rows
                });
            }
            else{
                res.status(404)
                    .json({"status": 404, "msg": "No songs an Album(id: " + req.params.albumid + ") not found."});
            }
        }
    });
});

router.get('/latest/:num', function(req, res){
    sql = "SELECT * FROM song ORDER BY create_time desc LIMIT " + req.params.num;

    mysqlConn.query(sql, function(err, rows, fields){
        if(err){
            res.status(500)
                .json({"status": 500, "msg": "Error querying latest: " + req.params.num + " songs.", "detailed_msg": err.message});
        }
        else{
            if(rows.length > 0){
                res.json({
                    "status": 200,
                    "songs": rows
                });
            }
            else{
                res.status(404)
                    .json({"status": 404, "msg": "No songs found."});
            }
        }
    });
});

router.get('/genre/:genre', function(req, res) {
  sql = "SELECT song.*, genre.name AS genre FROM song INNER JOIN genre ON song.song_id = genre.genre_id WHERE genre.name='" + req.params.genre + "'";

  mysqlConn.query(sql, function(err, rows, fields) {
    //Error selecting items by category
    if (err) {
      res.status(500)
          .json({"status": 500, "msg": "Error querying songs by genre", "detailed_msg": err.message});

    }
    else {
      if(rows.length > 0){
        res.json({
          "status": 200,
          "songs": rows
        });
      }
      else{
        res.status(404)
            .json({"status": 404, "msg": "No songs with genre: " + req.params.genre + " found."});
      }
    }
  });
});

router.get('/search/:txt', function(req, res) {
  sql = `SELECT s.song_id, s.name, s.price, s.duration, s.release, s.album_id, s.artist_id, s.genre_id, alb.name AS album_name, alb.img_url AS album_img_url, a.name AS artist_name, g.name AS genre_name
        FROM song s
        INNER JOIN genre g ON g.genre_id=s.genre_id
        INNER JOIN artist a ON a.artist_id=s.artist_id
        INNER JOIN album alb ON alb.album_id=s.album_id
        WHERE s.name LIKE '%` + req.params.txt + `%'`;

  mysqlConn.query(sql, function(err, rows, fields) {
    //Error selecting items by searchtext
    if (err) {
      res.status(500)
          .json({"status": 500, "msg": "Error querying songs with searchpattern", "detailed_msg": err.message});
    }
    else {
      if(rows.length > 0){
        res.json({
          "status": 200,
          "songs": rows
        });
      }
      else{
        res.status(404)
            .json({"status": 404, "msg": "No songs found with searchpattern: " + req.params.txt + "."});
      }
    }
  });
});

router.post('/addcomment/', function(req, res){
  var userid = req.body.userid;

  sql = `INSERT INTO(fk_comment_user, fk_comment_item, rating, text) VALUES(` + userid + `, ` + req.body.itemnumber + `, ` + req.body.rating + `, '` + req.body.commenttext + `')`;

  mysqlConn.query(sql, function(err, results){
    if(err) {
      res.status(404)
          .json({"status": 404, "msg": "Error inserting comment", "detailed_msg": err.message});
    }
    else {
      res.status(201).json(results);
    }
  });
});

module.exports = router;
