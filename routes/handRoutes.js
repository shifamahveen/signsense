const express = require('express');
const multer = require('multer');
const path = require('path');
const handController = require('../controllers/handController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// Multer for file uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
router.get('/', ensureAuthenticated, handController.renderIndexPage);
router.post('/detect', ensureAuthenticated, upload.single('image'), handController.detectHand);

// settings
router.get('/config', ensureAuthenticated, handController.renderUpdateRole);
router.post('/config', ensureAuthenticated, handController.updateRole);

module.exports = router;
