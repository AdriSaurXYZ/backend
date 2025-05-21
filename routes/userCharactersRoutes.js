const express = require('express');
const router = express.Router();
const controller = require('../controllers/userCharactersController');

router.post('/set', controller.setUserCharacter);
router.get('/:userId', controller.getUserCharacters);

module.exports = router;
