import mysql from 'mysql';

let pool = mysql.createPool({
    connectionLimit : 10,
    host: 'mariadb',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

export default pool;