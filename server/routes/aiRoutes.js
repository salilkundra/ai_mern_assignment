const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/ask-ai', aiController.askAI);
router.post('/save', aiController.saveChat);
router.get('/history', aiController.getHistory);

module.exports = router;