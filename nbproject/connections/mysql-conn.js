var mysql = require('mysql');
var connection = mysql.createConnection({
    "host": "localhost",
    "user": "root",
    "password": "webshop",
    "database": "soundstore"
});

connection.connect(function(err){
    if(err){
        console.log(err.message);
    }
});

module.exports = connection;
