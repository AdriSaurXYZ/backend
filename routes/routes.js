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

// PATCH: actualizar foto de perfil del usuario
router.patch('/profile-photo', async (req, res) => {
    const { email, photoUrl } = req.body;

    if (!email || !photoUrl) {
        return res.status(400).json({ message: 'Email y photoUrl son requeridos' });
    }

    try {
        const user = await User.findOneAndUpdate({ email }, { photoUrl }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Foto de perfil actualizada', user });
    } catch (error) {
        console.error('Error al actualizar la foto:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;
