const express = require('express');
const { registerUser, loginUser, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
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

    // Primero obtenemos el juego del personaje guardado
    const userQuery = `SELECT name, email, profile_character_id, profile_character_game FROM users WHERE email = ?`;
    db.query(userQuery, [email], (err, userResults) => {
        if (err) return res.status(500).json({ error: 'Error en base de datos' });
        if (userResults.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const user = userResults[0];
        const characterTable = user.profile_character_game === 'wuwa' ? 'characters_wuwa' : 'characters_hsr';

        const characterQuery = `SELECT profile_image_url FROM ${characterTable} WHERE id = ?`;
        db.query(characterQuery, [user.profile_character_id], (err, characterResults) => {
            if (err) return res.status(500).json({ error: 'Error al buscar personaje' });

            const profile_image_url = characterResults[0]?.profile_image_url || null;
            res.json({ name: user.name, email: user.email, profile_image_url });
        });
    });
});

router.patch('/profile-update',authMiddleware, updateProfile);



// PATCH: actualizar foto de perfil del usuario
router.patch('/profile-photo', (req, res) => {
    const { email, characterId, game } = req.body;

    if (!email || !characterId || !game) {
        return res.status(400).json({ message: 'Email, characterId y game son requeridos' });
    }

    // Validar que characterId existe en la tabla del juego correcto
    const characterTable = game === 'wuwa' ? 'characters_wuwa' : 'characters_hsr';

    db.query(`SELECT id FROM ${characterTable} WHERE id = ?`, [characterId], (err, characterResults) => {
        if (err) return res.status(500).json({ message: 'Error validando personaje', error: err.message });
        if (characterResults.length === 0) return res.status(404).json({ message: 'Personaje no encontrado' });

        // Actualizar usuario con ID y juego
        const updateQuery = 'UPDATE users SET profile_character_id = ?, profile_character_game = ? WHERE email = ?';
        db.query(updateQuery, [characterId, game, email], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error actualizando usuario', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

            res.json({ message: 'Foto de perfil actualizada correctamente' });
        });
    });
});



const taskRoutes = require('./taskRoutes');
router.use('/tasks', taskRoutes);


module.exports = router;
