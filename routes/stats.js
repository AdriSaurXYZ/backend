const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajusta si tu conexión está en otra ruta

// GET: Obtener fechas en las que el usuario alcanzó 500 puntos
// GET: Contar cuántas veces el usuario llegó a 500 puntos
router.get('/stats/500-points-count/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const [rows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM tareas_500_log
      WHERE usuario_id = ?
    `, [userId]);

        res.json(rows[0]);  // { total: X }
    } catch (error) {
        console.error('Error al obtener el contador de 500 puntos:', error);
        res.status(500).json({ error: 'Error al obtener el contador' });
    }
});


// POST: Registrar que el usuario ha llegado a 500 puntos hoy
router.post('/500-points-log', async (req, res) => {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    try {
        const [existing] = await db.query(`
            SELECT id FROM tareas_500_log
            WHERE usuario_id = ? AND fecha = ?
        `, [userId, today]);

        if (existing.length === 0) {
            await db.query(`
                INSERT INTO tareas_500_log (usuario_id, fecha)
                VALUES (?, ?)
            `, [userId, today]);

            res.status(201).json({ message: 'Registro guardado correctamente' });
        } else {
            res.status(200).json({ message: 'Ya registrado para hoy' });
        }
    } catch (error) {
        console.error('Error al registrar log de 500 puntos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
