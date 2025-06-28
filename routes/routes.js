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
    const game = req.query.game || 'hsr'; // Por defecto, HSR

    if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
    }

    const tableName = game === 'wuwa' ? 'characters_wuwa' : 'characters_hsr';

    const query = `
        SELECT u.name, u.email, c.profile_image_url 
        FROM users u
        LEFT JOIN ${tableName} c ON u.profile_character_id = c.id
        WHERE u.email = ?
    `;

    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('❌ Error en consulta de perfil:', err);
            return res.status(500).json({ error: 'Error en base de datos' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(results[0]);
    });
});

router.patch('/profile-update',authMiddleware, updateProfile);



// PATCH: actualizar foto de perfil del usuario
router.patch('/profile-photo', (req, res) => {
    const { email, characterId, game } = req.body;
    const tableName = game === 'wuwa' ? 'characters_wuwa' : 'characters_hsr';

    if (!email || !characterId) {
        return res.status(400).json({ message: 'Email y characterId son requeridos' });
    }

    // Verificar si el characterId existe en la tabla del juego
    db.query(`SELECT id FROM ${tableName} WHERE id = ?`, [characterId], (err, characterResults) => {
        if (err) return res.status(500).json({ message: 'Error validando personaje', error: err.message });
        if (characterResults.length === 0) return res.status(404).json({ message: 'Personaje no encontrado' });

        // Actualizar usuario
        const updateQuery = 'UPDATE users SET profile_character_id = ? WHERE email = ?';
        db.query(updateQuery, [characterId, email], (err, result) => {
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
});


const taskRoutes = require('./taskRoutes');
router.use('/tasks', taskRoutes);


module.exports = router;
