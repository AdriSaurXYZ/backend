// controllers/statsController.js
const db = require('../db'); // Tu conexión a la base de datos

exports.log500PointsDay = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Falta userId' });

    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    try {
        const [exists] = await db.query(
            'SELECT 1 FROM tareas_500_log WHERE usuario_id = ? AND fecha = ? LIMIT 1',
            [userId, today]
        );

        if (exists) {
            return res.status(200).json({ message: 'Ya registrado hoy' });
        }

        await db.query(
            'INSERT INTO tareas_500_log (usuario_id, fecha) VALUES (?, ?)',
            [userId, today]
        );

        res.status(201).json({ message: 'Registro guardado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al registrar 500 puntos' });
    }
};
