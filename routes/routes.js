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

    const query = `
        SELECT u.name, u.email, c.profile_image_url 
        FROM users u
        LEFT JOIN characters_hsr c ON u.profile_character_id = c.id
        WHERE u.email = ?
    `;

    db.query(query, [email], (err, results) => {
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
router.patch('/profile-photo', (req, res) => {
    const { email, characterId } = req.body;

    console.log('📩 PATCH /profile-photo recibido con:');
    console.log('Email:', email);
    console.log('Character ID:', characterId);

    if (!email || !characterId) {
        return res.status(400).json({ message: 'Email y characterId son requeridos' });
    }

    const query = 'UPDATE users SET profile_character_id = ? WHERE email = ?';
    db.query(query, [characterId, email], (err, result) => {
        if (err) {
            console.error('🔥 Error al actualizar usuario:', err);
            return res.status(500).json({ message: 'Error en base de datos', error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        console.log('✅ Imagen de perfil actualizada para el usuario:', email);
        res.json({ message: 'Foto de perfil actualizada' });
    });
});

const taskRoutes = require('./taskRoutes');
router.use('/tasks', taskRoutes);


module.exports = router;
