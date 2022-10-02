const mysql = require('mysql');

const mysqlConnecction = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Manyito123!',
    database: 'samuidb',
    port: '3306'
})

mysqlConnecction.connect(err => {
    if(err){
        console.log('Error en db: ', err);
    } else {
        console.log('DB OK')
    }
});

module.exports = mysqlConnecction;