const db = require('../db');

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
