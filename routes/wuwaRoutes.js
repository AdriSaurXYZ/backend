const express = require('express');
const router = express.Router();
const { getAllWuWaCharacters } = require('../controllers/wuwaController');

router.get('/', getAllWuWaCharacters);

module.exports = router;
