const db = require('../db');

exports.getAllWuWaCharacters = (req, res) => {
    const query = `
        SELECT 
            c.*, 
            GROUP_CONCAT(r.name) AS roles
        FROM characters_wuwa c
        LEFT JOIN character_roles_wuwa cr ON c.id = cr.character_id
        LEFT JOIN roles r ON cr.role_id = r.id
        GROUP BY c.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener personajes de WUWA:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        const formatted = results.map(char => ({
            ...char,
            roles: char.roles ? char.roles.split(',') : []
        }));

        res.status(200).json(formatted);
    });
};
