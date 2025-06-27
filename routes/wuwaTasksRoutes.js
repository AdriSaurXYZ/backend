const express = require('express');
const router = express.Router();
const wuwaTaskController = require('../controllers/wuwaTaskController');
const authenticate = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Rutas protegidas
router.get('/', authenticate, wuwaTaskController.getTasks);
router.post('/', authenticate, upload.single('image'), wuwaTaskController.createTask);
router.put('/:id', authenticate, wuwaTaskController.updateTask);
router.put('/:id/status', authenticate, wuwaTaskController.updateTaskStatus);
router.put('/:id/category', authenticate, wuwaTaskController.updateTaskCategory);
router.delete('/:id', authenticate, wuwaTaskController.deleteTask);

module.exports = router;
