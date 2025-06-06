require('dotenv').config(); // Ya lo tienes, perfecto
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


// Conecta base de datos
require('./db'); // <-- Asegura que se conecte cuando arranca

// Rutas
const userRoutes = require('./routes/routes');
const taskRoutes = require('./routes/taskRoutes');
const userCharactersRoutes = require('./routes/userCharactersRoutes');
const charactersRoutes = require('./routes/characterRoutes');


const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: '*', // O pon el dominio exacto del frontend si quieres restringirlo
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // AÑADIDO PATCH Y OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.get('/', (req, res) => {
    res.send('Bienvenido al servidor de DailyMana');
});

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/user-characters', userCharactersRoutes);
app.use('/api/characters', charactersRoutes);
app.use('/uploads', express.static('uploads'));

// Usa el puerto definido por Railway o 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
