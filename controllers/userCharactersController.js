const db = require('../config/db'); // tu conexión MySQL

// Marcar o actualizar si el usuario tiene o no un personaje
exports.setUserCharacter = async (req, res) => {
    const { userId, characterId, hasCharacter } = req.body;

    try {
        const [result] = await db.execute(`
      INSERT INTO user_characters (user_id, character_id, has_character)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE has_character = ?
    `, [userId, characterId, hasCharacter, hasCharacter]);

        res.status(200).json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar personaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener lista de personajes marcados por el usuario
exports.getUserCharacters = async (req, res) => {
    const userId = req.params.userId;

    try {
        const [rows] = await db.execute(`
      SELECT character_id, has_character FROM user_characters WHERE user_id = ?
    `, [userId]);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener personajes del usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
