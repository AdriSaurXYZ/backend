const db = require('../db');

exports.getAllCharacters = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM characters_hsr');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener personajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
