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

// Obtener perfil con logs
router.get('/profile', (req, res) => {
    const email = req.query.email;
    let game = req.query.game || 'hsr';

    console.log('📥 GET /profile');
    console.log('➡️ Email:', email, '| 🎮 Game:', game);

    if (!email) {
        console.warn('⚠️ No se proporcionó email');
        return res.status(400).json({ error: 'Email es requerido' });
    }

    if (game !== 'hsr' && game !== 'wuwa') {
        console.warn('⚠️ Juego inválido:', game);
        return res.status(400).json({ error: 'Juego no válido (debe ser hsr o wuwa)' });
    }

    const userQuery = `
        SELECT name, email,
            profile_character_id_hsr,
            profile_character_id_wuwa
        FROM users WHERE email = ?
    `;

    db.query(userQuery, [email], (err, userResults) => {
        if (err) {
            console.error('❌ Error al buscar usuario en la base de datos:', err);
            return res.status(500).json({ error: 'Error en base de datos' });
        }

        if (userResults.length === 0) {
            console.warn('⚠️ Usuario no encontrado con email:', email);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = userResults[0];
        console.log('✅ Usuario encontrado:', user);

        let characterId;
        let characterTable;

        if (game === 'hsr') {
            characterId = user.profile_character_id_hsr;
            characterTable = 'characters_hsr';
        } else {
            characterId = user.profile_character_id_wuwa;
            characterTable = 'characters_wuwa';
        }

        if (!characterId) {
            console.log('ℹ️ Usuario no tiene personaje de perfil para', game);
            return res.json({
                name: user.name,
                email: user.email,
                profile_image_url: null,
                character_id: null,
                game
            });
        }

        console.log('🔍 Buscando personaje con ID:', characterId, 'en', characterTable);

        const characterQuery = `SELECT profile_image_url FROM ${characterTable} WHERE id = ?`;
        db.query(characterQuery, [characterId], (err, characterResults) => {
            if (err) {
                console.error('❌ Error al buscar personaje:', err);
                return res.status(500).json({ error: 'Error al buscar personaje' });
            }

            if (characterResults.length === 0) {
                console.warn('⚠️ Personaje no encontrado con ID:', characterId);
            }

            const profile_image_url = characterResults[0]?.profile_image_url || null;

            console.log('✅ Perfil devuelto correctamente');
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

// Actualizar foto de perfil con logs
router.patch('/profile-photo', (req, res) => {
    const { email, characterId, game } = req.body;

    console.log('📥 PATCH /profile-photo', req.body);

    if (!email || !characterId || !game) {
        console.warn('⚠️ Faltan parámetros');
        return res.status(400).json({ message: 'Email, characterId y game son requeridos' });
    }

    const characterTable = game === 'wuwa' ? 'characters_wuwa' :
        game === 'hsr' ? 'characters_hsr' : null;

    const updateField = game === 'wuwa' ? 'profile_character_id_wuwa' :
        game === 'hsr' ? 'profile_character_id_hsr' : null;

    if (!characterTable || !updateField) {
        console.warn('⚠️ Juego inválido:', game);
        return res.status(400).json({ message: 'Juego no válido (debe ser hsr o wuwa)' });
    }

    db.query(`SELECT id FROM ${characterTable} WHERE id = ?`, [characterId], (err, characterResults) => {
        if (err) {
            console.error('❌ Error al validar personaje:', err);
            return res.status(500).json({ message: 'Error validando personaje', error: err.message });
        }

        if (characterResults.length === 0) {
            console.warn('⚠️ Personaje no encontrado con ID:', characterId);
            return res.status(404).json({ message: 'Personaje no encontrado' });
        }

        const updateQuery = `UPDATE users SET ${updateField} = ? WHERE email = ?`;
        db.query(updateQuery, [characterId, email], (err, result) => {
            if (err) {
                console.error('❌ Error al actualizar usuario:', err);
                return res.status(500).json({ message: 'Error actualizando usuario', error: err.message });
            }

            if (result.affectedRows === 0) {
                console.warn('⚠️ Usuario no encontrado al actualizar:', email);
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            console.log('✅ Foto de perfil actualizada correctamente');
            res.json({ message: 'Foto de perfil actualizada correctamente' });
        });
    });
});

router.patch('/profile-update', authMiddleware, updateProfile);

const taskRoutes = require('./taskRoutes');
router.use('/tasks', taskRoutes);

module.exports = router;
