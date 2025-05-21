const db = require('../db');

exports.getAllCharacters = (req, res) => {
    db.query('SELECT * FROM characters_hsr', (err, results) => {
        if (err) {
            console.error('Error al obtener personajes:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(200).json(results);
    });
};
