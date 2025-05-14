const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'servidordailymana.mysql.database.azure.com',
    user: 'Adrian',
    password: 'Abcd123.,',
    database: 'dailymana',
    ssl: {
        rejectUnauthorized: true, // Cambia según tus necesidades
    },
});


db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conectado a la base de datos MySQL');
});

module.exports = db;