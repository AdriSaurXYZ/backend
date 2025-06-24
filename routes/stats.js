// routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.post('/500-points-log', statsController.log500PointsDay);

module.exports = router;
