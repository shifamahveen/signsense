const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { log } = require('console');

const CROP_HEALTH_API_URL = 'https://crop.kindwise.com/api/v1/identification';
const API_KEY = 'HNBy4TtuUzambDfapFqs7nJellKtf8Ce3KR7jCPQOwQoRgi5oF';
let apiCreditsRemaining = 79; 

// Path to the credits file to store credits count
const creditsFilePath = path.join(__dirname, 'credits.json');

// Load the remaining credits from file
if (fs.existsSync(creditsFilePath)) {
    const creditsData = fs.readFileSync(creditsFilePath, 'utf8');
    apiCreditsRemaining = JSON.parse(creditsData).creditsRemaining;
}
module.exports = {
    uploadImage: (req, res) => {
        let user = req.session.user;
        res.render('upload', { user });
    },

// Detect disease logic
detectDisease: async (req, res) => {
    let user = req.session.user;

    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const imagePath = path.join(__dirname, '../uploads', file.filename);
        const imageData = fs.readFileSync(imagePath).toString('base64');
        const base64Image = `data:image/jpeg;base64,${imageData}`;

        const payload = {
            images: [base64Image],
            latitude: 49.207, 
            longitude: 16.608,
            similar_images: true
        };

        const response = await axios.post(CROP_HEALTH_API_URL, payload, {
            headers: {
                'Api-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const diseaseInfo = response.data;

        apiCreditsRemaining--;

        fs.writeFileSync(creditsFilePath, JSON.stringify({ creditsRemaining: apiCreditsRemaining }));

        const apiUsagePercentage = ((79 - apiCreditsRemaining) / 79) * 100;

        const uploadedImageUrl = `data:image/jpeg;base64,${imageData}`;
        res.render('result', { diseaseInfo, uploadedImageUrl, user, apiUsagePercentage, apiCreditsRemaining });

    } catch (error) {
        console.error('Error detecting disease:', error.response ? error.response.data : error.message);
        res.status(500).send('Error detecting disease.');
    }
}

};
