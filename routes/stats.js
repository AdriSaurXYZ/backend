// routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.post('/500-points-log', statsController.log500PointsDay);
router.get('/api/user/:id/stats/500-points-days', statsController.get500PointDays);
router.get('/api/user/:id/stats/500-points-count', statsController.get500PointDaysCount);

module.exports = router;
