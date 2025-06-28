const express = require('express');
const {
    registerUser,
    loginUser,
    updateProfile
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../db');
const router = express.Router();

// Registro
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Obtener perfil
router.get('/profile', (req, res) => {
    const email = req.query.email;
    const game = req.query.game;

    if (!email || !game) {
        return res.status(400).json({ error: 'Email y game son requeridos' });
    }

    const userQuery = `
    SELECT name, email,
      profile_character_id_hsr,
      profile_character_id_wuwa
    FROM users WHERE email = ?
  `;

    db.query(userQuery, [email], (err, userResults) => {
        if (err) return res.status(500).json({ error: 'Error en base de datos' });
        if (userResults.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const user = userResults[0];

        // Escoger el campo correcto según el juego
        let characterId;
        let characterTable;

        if (game === 'hsr') {
            characterId = user.profile_character_id_hsr;
            characterTable = 'characters_hsr';
        } else if (game === 'wuwa') {
            characterId = user.profile_character_id_wuwa;
            characterTable = 'characters_wuwa';
        } else {
            return res.status(400).json({ error: 'Juego no válido (debe ser hsr o wuwa)' });
        }

        if (!characterId) {
            return res.json({
                name: user.name,
                email: user.email,
                profile_image_url: null,
                character_id: null,
                game
            });
        }

        const characterQuery = `SELECT profile_image_url FROM ${characterTable} WHERE id = ?`;
        db.query(characterQuery, [characterId], (err, characterResults) => {
            if (err) return res.status(500).json({ error: 'Error al buscar personaje' });

            const profile_image_url = characterResults[0]?.profile_image_url || null;

            res.json({
                name: user.name,
                email: user.email,
                profile_image_url,
                character_id: characterId,
                game
            });
        });
    });
});

// Actualizar foto de perfil
router.patch('/profile-photo', (req, res) => {
    const { email, characterId, game } = req.body;

    if (!email || !characterId || !game) {
        return res.status(400).json({ message: 'Email, characterId y game son requeridos' });
    }

    const characterTable = game === 'wuwa' ? 'characters_wuwa' : game === 'hsr' ? 'characters_hsr' : null;
    const updateField = game === 'wuwa' ? 'profile_character_id_wuwa' : game === 'hsr' ? 'profile_character_id_hsr' : null;

    if (!characterTable || !updateField) {
        return res.status(400).json({ message: 'Juego no válido (debe ser hsr o wuwa)' });
    }

    // Validar que el personaje existe
    db.query(`SELECT id FROM ${characterTable} WHERE id = ?`, [characterId], (err, characterResults) => {
        if (err) return res.status(500).json({ message: 'Error validando personaje', error: err.message });
        if (characterResults.length === 0) return res.status(404).json({ message: 'Personaje no encontrado' });

        // Actualizar el campo correcto
        const updateQuery = `UPDATE users SET ${updateField} = ? WHERE email = ?`;
        db.query(updateQuery, [characterId, email], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error actualizando usuario', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

            res.json({ message: 'Foto de perfil actualizada correctamente' });
        });
    });
});

router.patch('/profile-update', authMiddleware, updateProfile);

// Tareas
const taskRoutes = require('./taskRoutes');
router.use('/tasks', taskRoutes);

module.exports = router;
