const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');
const multer = require('multer');
const { upload } = require('../config/cloudinary'); // usa el upload de Cloudinary

// Configuración de multer
//const upload = multer({ dest: 'uploads/' });

// Rutas con autenticación
router.post('/', authenticate, upload.single('image'), taskController.createTask);
router.get('/', authenticate, taskController.getTasks);
router.put('/:id/status', authenticate, taskController.updateTaskStatus);
router.put('/:id', authenticate, taskController.updateTask);
router.delete('/:id', authenticate, taskController.deleteTask);
router.put('/:id/category', authenticate, taskController.updateTaskCategory);
router.post('/', authenticate, upload.single('image'), taskController.createTask);

router.get('/stats/500-points-days/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const [rows] = await db.query(`
      SELECT DATE(fecha) AS fecha, SUM(puntos) AS total_puntos
      FROM tareas
      WHERE usuario_id = ?
      GROUP BY DATE(fecha)
      HAVING total_puntos >= 500
      ORDER BY fecha DESC
    `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;
