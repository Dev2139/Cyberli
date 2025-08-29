const express = require('express');
const { analyzeNews } = require('../controllers/newsController');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();


router.post('/analyze', authMiddleware, analyzeNews);



module.exports = router;