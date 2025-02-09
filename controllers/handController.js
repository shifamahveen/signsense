const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path'); 
const FormData = require('form-data');
const requestTracker = require('../services/requestTracker');
const { log } = require('console');

exports.renderIndexPage = (req, res) => {
    try {
        const user = req.session.user || null;
        
        res.render('index', { user });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.detectHand = async (req, res) => {
    const user = req.session.user || null;
    if (!user) return res.redirect('/login');

    try {
        let imagePath;
        let data = new FormData();

        // ✅ Check if image is uploaded via file input
        if (req.file) {
            imagePath = path.join(__dirname, '../public/uploads/', req.file.filename);
        }
        // ✅ If image is captured from camera
        else if (req.body.imageData) {
            const base64Data = req.body.imageData.replace(/^data:image\/png;base64,/, '');
            imagePath = path.join(__dirname, '../public/uploads/', `camera_capture_${Date.now()}.png`);
            fs.writeFileSync(imagePath, base64Data, 'base64');
        } else {
            return res.render('result', { error: 'No image provided', result: null, imageUrl: null, user });
        }

        // ✅ Ensure file exists before sending to API
        if (!fs.existsSync(imagePath)) {
            return res.render('result', { error: 'File not found', result: null, imageUrl: null, user });
        }

        // ✅ Track API Request
        requestTracker.trackRequest(user.id);

        // ✅ Check if limit exceeded
        if (requestTracker.getRemainingRequests(user.id) <= 0) {
            return res.render('result', { error: 'Monthly limit exceeded', result: null, imageUrl: null, user });
        }

        // ✅ Append image to form data
        data.append('imageFile', fs.createReadStream(imagePath));

        // ✅ Call Hand Recognition API
        const response = await fetch('https://hand-recognition2.p.rapidapi.com/hand_analysis', {
            method: 'POST',
            headers: {
                'x-rapidapi-key': 'ea86ec0756msh17e532df1e1c9c9p170c20jsnebad0933d91c',
                'x-rapidapi-host': 'hand-recognition2.p.rapidapi.com',
                ...data.getHeaders(),
            },
            body: data,
        });

        const result = await response.json();
        console.log('📤 API Response:', result);

        const usagePercentage = requestTracker.getUsagePercentage(user.id);
        console.log(result);
        
        res.render('result', { 
            error: null, 
            result, 
            user, 
            imageUrl: `/uploads/${path.basename(imagePath)}`,
            usagePercentage
        });

    } catch (error) {
        res.render('result', { error: 'Error processing image', result: null, imageUrl: null, user });
    }
};


exports.renderUpdateRole = (req, res) => {
    res.render('updateRole', { user: req.session.user });
};

exports.updateRole = (req, res) => {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
        return res.status(400).send("Invalid role selected");
    }
    
    req.session.user.role = role;
    res.redirect('/update-role');
};
