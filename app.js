const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const multer = require('multer');
const handRoutes = require('./routes/handRoutes');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || '0c8eccddb63bb2f42b14de61ef1e5962e0a6699671cb3cccf6514eb4f477d675a69e6a4933ea29054bf27959ff91c7fe31f9381897d4472574b829c8ab9efc21',
  resave: false,
  saveUninitialized: true,
}));

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use((req, res, next) => {
  res.locals.username = req.session.username || null; 
  next();
});

app.use('/', authRoutes);    
app.use('/', handRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});