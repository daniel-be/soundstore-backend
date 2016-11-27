/* jshint esversion: 6 */
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var mysqlConn = require('../connections/mysql-conn');
var sql = "";

router.post('/register', function(req, res){
    sql = "SELECT user_id FROM user WHERE email='" + req.body.email + "'";

    mysqlConn.query(sql, function(err, rows, fields){
        //Error executing SELECT user by email query
        if(err){
            res.status(500)
                .json({"status": 500, "msg": "Error executing SELECT user by email query", "detailed_msg": err.message});
        }
        else{
            //User with entered email already exists
            if(rows.length > 0){
                res.status(409)
                    .json({"status": 409, "msg": "User with this email already exists"});
            }
            else{
                bcrypt.genSalt(10, function(err, salt){
                    //Error generating salt
                    if(err){
                        res.status(500)
                            .json({"status": 500, "msg": "Error generating salt.", "detailed_msg": err.message});
                    }
                    else{
                        bcrypt.hash(req.body.password, salt, function(err, encrypted){
                            //Error hashing password
                            if(err){
                                res.status(500)
                                    .json({"status": 500, "msg": "Error hashing password.", "detailed_msg": err.message});
                            }
                            else{
                                //Insert user in MySQL DB
                                sql = "INSERT INTO user(email, password) VALUES('" +  req.body.email + "', '" + encrypted + "')";

                                mysqlConn.query(sql, function(err, results){
                                    //Error executing user-insert query
                                    if(err){
                                        res.status(500)
                                            .json({"status": 500, "msg": "Error inserting user in MySQL DB.", "detailed_msg": err.message});
                                    }
                                    else{
                                        res.status(201).json({
                                          "status": 201,
                                          "insertedUser": results
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});

router.get('/countries', function(req, res) {
    sql = "SELECT country_id, en, code FROM country";

    mysqlConn.query(sql, function(err, rows, fields) {
      if(err){
        res.status(500)
            .json({"status": 500, "msg": "Error querying countries.", "detailed_msg": err.message});
      }
      else{
        res.status(200).json({
          "status": 200,
          "countries": rows
        });
      }
    });
});

router.post('/login', function(req, res){
    sql = "SELECT password FROM user WHERE email='" + req.body.email + "'";

    mysqlConn.query(sql, function(err, rows, fields){
        //Error querying user for login
        if(err){
            res.status(500)
                .json({"status": 500, "msg": "Error SELECT password FROM user.", "detailed_msg": err.message});
        }
        else{
          if(rows.length > 0){
            bcrypt.compare(req.body.password, rows[0].password, function(err, match){
                //Error in password comparison
                if(err){
                    res.status(500)
                        .json({"status": 500, "msg": "Password comparison failed.", "detailed_msg": err.message});
                }
                else{
                    if(match){
                        res.status(200)
                            .json({"status": 200, "msg": "Login successfull."});
                    }
                    else{
                        res.status(401).json({"status": 401, "msg": "Password authetification failed."});
                    }
                }
            });
          }
          else{
            res.status(404).json({"status": 404, "msg": "No user found."});
          }
        }
    });
});

router.get('/exists/:email', function(req, res){
    sql = "SELECT id FROM user WHERE email='" + req.params.email + "'";

    mysqlConn.query(sql, function(err, rows, fields){
        //Error in email exits check
        if(err){
            res.status(500)
                .json({"status": 500, "msg": "Error checking email exists.", "detailed_msg": err.message});
        }
        else{
            if(rows.length > 0){
                res.status(409)
                    .json({"status": 409,"exists": true, "msg": "User with this email already exists"});
            }
            else{
                res.json({"status": 200,"exists": false});
            }
        }
    });
});

router.get('/test', function(req, res) {
  sql = "INSERT INTO genre(name) VALUES('Trap'), ('House')";

  mysqlConn.query(sql, function(err, results) {
    if(err){
      console.log("err");
    }
    else{
      console.log(results);
    }
  });
});

router.get('/billingaddress/:email', function(req, res) {
  sql = `SELECT u.email, u.firstname, u.lastname, a.street, a.housenumber, c.postal_code, c.name, co.en, co.code
          FROM user u
          INNER JOIN address a ON a.address_id=u.address_id
          INNER JOIN city c ON c.city_id=a.city_id
          INNER JOIN country co ON co.country_id=c.country_id
          WHERE u.email='` + req.params.email + `'`;

  mysqlConn.query(sql, function(err, rows, fields) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error querying billingaddress.", "detailed_msg": err.message});
    }
    else{
      if(rows.length === 0){
        res.status(404)
            .json({"status": 404, "msg": "No existing user with email: " + req.params.email});
      }
      else{
        res.json({
          "status": 200,
          "address": rows[0]
        });
      }
    }
  });
});

router.post('/addbillingaddress', function(req, res) {
  var city = {
    postalcode: req.body.postalcode,
    name: req.body.cityname,
    countryid: req.body.countryid
  };
  var address = {
    street: req.body.street,
    housenumber: req.body.housenumber,
    cityid: -1
  };
  var user = {
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    addressid: -1,
  };
  sql = "SELECT city_id FROM city WHERE postal_code='" + req.body.postalcode + "'";

  mysqlConn.query(sql, function(err, rows, fields) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error querying city of user.", "detailed_msg": err.message});
    }
    else{
      if(rows.length === 0){
        insertCity(city, res, function(insCityid) {
          address.cityid = insCityid;

          insertAddress(address, res, function(insAddressid) {
            user.addressid = insAddressid;

            updateUserAddressFK(user, res);
          });
        });
      }
      else{
        address.cityid = rows[0].city_id;
        sql = "SELECT address_id FROM address WHERE street='" + address.street + "' AND housenumber='" + address.housenumber + "'";

        mysqlConn.query(sql, function(err, rows, fields) {
          if(err){
            res.status(500)
                .json({"status": 500, "msg": "Error querying entered address.", "detailed_msg": err.message});
          }
          else{
            if(rows.lenght === 0){
              insertAddress(address, res, function(insAddressid) {
                user.addressid = insAddressid;

                updateUserAddressFK(user, res);
              });
            }
            else{
              user.addressid = rows[0].address_id;

              updateUserAddressFK(user, res);
            }
          }
        });
      }
    }
  });
});

function insertCity(objCity, res, callback) {
  sql = "INSERT INTO city(postal_code, name, country_id) VALUES('" + objCity.postalcode + "', '" + objCity.name + "', " + objCity.countryid + ")";

  mysqlConn.query(sql, function(err, results) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error inserting city.", "detailed_msg": err.message});
    }
    else{
      callback(results.insertId);
    }
  });
}

function insertAddress(objAddress, res, callback) {
  sql = "INSERT INTO address(street, housenumber, city_id) VALUES('" + objAddress.street + "', '" + objAddress.housenumber + "', " + objAddress.cityid + ")";

  mysqlConn.query(sql, function(err, results) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error inserting address.", "detailed_msg": err.message});
    }
    else{
      callback(results.insertId);
    }
  });
}

function updateUserAddressFK(objUser, res) {
  sql = "UPDATE user SET address_id=" + objUser.addressid + ", firstname='" + objUser.firstname + "', lastname='" + objUser.lastname + "' WHERE email='" + objUser.email +  "'";

  mysqlConn.query(sql, function(err, results) {
    if(err){
      res.status(500)
          .json({"status": 500, "msg": "Error updating updateUserAddressFK.", "detailed_msg": err.message});
    }
    else{
      res.status(201)
        .json({"status": 201, "msg": "Billingaddress successfully added."});
    }
  });
}

module.exports = router;
