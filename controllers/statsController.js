const db = require('../db'); // Conexión a la base de datos (mysql2 o similar)

// 🟢 Registra un día en que el usuario alcanza 500 puntos (sin duplicados)
exports.log500PointsDay = (req, res) => {
    const { usuario_id } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ message: 'Falta el usuario_id' });
    }

    const fechaHoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const insertQuery = `
        INSERT INTO tareas_500_log (usuario_id, fecha)
        SELECT ?, ?
        WHERE NOT EXISTS (
            SELECT 1 FROM tareas_500_log WHERE usuario_id = ? AND fecha = ?
        )
    `;

    db.query(insertQuery, [usuario_id, fechaHoy, usuario_id, fechaHoy], (err, result) => {
        if (err) {
            console.error('❌ Error al insertar log de 500 puntos:', err);
            return res.status(500).json({ message: 'Error en la base de datos', error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(200).json({ message: 'Ya se había registrado el día de hoy' });
        }

        res.status(201).json({ message: '✅ Día de 500 puntos registrado con éxito' });
    });
};

// 🟢 Devuelve la lista de días en que el usuario alcanzó 500 puntos
exports.get500PointDays = (req, res) => {
    const userId = req.params.id;

    const query = 'SELECT fecha FROM tareas_500_log WHERE usuario_id = ? ORDER BY fecha DESC';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener los días con 500 puntos:', err);
            return res.status(500).json({ error: 'Error en la base de datos', message: err.message });
        }

        res.json(results);
    });
};

// 🟢 Devuelve el número total de días en que el usuario alcanzó 500 puntos
exports.get500PointDaysCount = (req, res) => {
    const userId = req.params.id;

    const query = 'SELECT COUNT(*) AS count FROM tareas_500_log WHERE usuario_id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error al contar los días con 500 puntos:', err);
            return res.status(500).json({ error: 'Error en la base de datos', message: err.message });
        }

        res.json({ count: results[0].count });
    });
};
