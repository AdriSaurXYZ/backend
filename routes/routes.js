const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const db = require('../db');  // Asegúrate de importar la conexión a la base de datos
const router = express.Router();

// Ruta para registrar un usuario
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

// Ruta para obtener perfil del usuario (por email query param)
router.get('/profile', (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
    }

    db.query('SELECT name, email FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en base de datos' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
});

module.exports = router;
