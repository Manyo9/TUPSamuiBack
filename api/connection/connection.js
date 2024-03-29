const mysql = require('mysql');
require('dotenv').config();

const mysqlConnecction = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
})

mysqlConnecction.connect(err => {
    if(err){
        console.log('Error en db: ', err);
    } else {
        console.log('DB OK')
    }
});

module.exports = mysqlConnecction;