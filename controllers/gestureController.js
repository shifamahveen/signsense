const fetch = require('node-fetch'); // Ensure node-fetch is installed
const FormData = require('form-data'); // Use the form-data package
const path = require('path');

const gestureController = {
    showIndex: (req, res) => {
        const user = req.session.user;
        res.render('index', { user });
    },

    submitImage: async (req, res) => {
        const user = req.session.user;

        try {
            if (!req.file) {
                return res.status(400).send('No file uploaded');
            }

            // Convert Buffer to Blob
            const formData = new FormData();
            formData.append('api_key', 'QlF1LIFoUMhzc4IX6YWXgLXprdfh4kPx');
            formData.append('api_secret', 'raUdHwW8adBldgvAPSGtABUCEwLwmczx');
            formData.append('image_file', req.file.buffer, { filename: req.file.originalname });

            const response = await fetch('https://api-us.faceplusplus.com/humanbodypp/v1/gesture', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            // Convert image buffer to base64 for rendering in EJS
            const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

            if (!data.hands || data.hands.length === 0) {
                return res.render('result', {
                    handGesture: "No hand detected",
                    handRectangle: null,
                    imageUrl: imageBase64,
                    user
                });
            }

            res.render('result', {
                handGesture: data.hands[0]?.gesture,
                handRectangle: data.hands[0]?.hand_rectangle,
                imageUrl: imageBase64,
                user
            });

        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Error processing the image');
        }
    }
};

module.exports = gestureController;
