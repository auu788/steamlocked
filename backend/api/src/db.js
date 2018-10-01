import mysql from 'mysql';

let connection = mysql.createConnection({
    host: 'mariadb',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
    if (err)
        throw err;

    console.log("[MYSQL] Connected succesfully.");
})

export default connection;