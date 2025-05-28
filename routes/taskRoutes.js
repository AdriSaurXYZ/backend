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

module.exports = router;
