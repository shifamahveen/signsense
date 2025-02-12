const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const imageController = require('../controllers/imageController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/', ensureAuthenticated, imageController.uploadImage);
router.post('/upload', ensureAuthenticated, upload.single('image'), imageController.detectDisease);

module.exports = router;