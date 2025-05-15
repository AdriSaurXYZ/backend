require('dotenv').config(); // Asegúrate de cargar las variables del .env
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Railway requiere puerto específico
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true // Railway permite conexiones SSL
    }
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err);
        process.exit(1);
    }
    console.log('✅ Conectado a la base de datos MySQL en Railway');
});

module.exports = db;
