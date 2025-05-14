const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.post('/', authenticate, taskController.createTask);
router.get('/', authenticate, taskController.getTasks);
router.put('/:id/status', authenticate, taskController.updateTaskStatus);
// Actualizar título y descripción de una tarea
router.put('/:id', authenticate, taskController.updateTask);
// Eliminar una tarea
router.delete('/:id', authenticate, taskController.deleteTask);
router.put('/:id/category', authenticate, taskController.updateTaskCategory);



module.exports = router;
