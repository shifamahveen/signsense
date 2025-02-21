const express = require('express');
const multer = require('multer');
const gestureController = require('../controllers/gestureController');
const { ensureAuthenticated } = require('../middleware/authMiddleware'); 

const router = express.Router();

const upload = multer(); // memory storage for image buffer

router.get('/', ensureAuthenticated, gestureController.showIndex);
router.post('/result', ensureAuthenticated, upload.single('image_file'), gestureController.submitImage);

module.exports = router;
