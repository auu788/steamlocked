import mysql from 'mysql';

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'steamlocked'
});

connection.connect((err) => {
    if (err)
        throw err;

    console.log("Connected");
})

export default connection;