const fs = require('fs'); 
const path = require('path');
const fetch = require('node-fetch'); 
const FormData = require('form-data'); 
const { log } = require('console');

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

            const formData = new FormData();
            formData.append('api_key', 'QlF1LIFoUMhzc4IX6YWXgLXprdfh4kPx');
            formData.append('api_secret', 'raUdHwW8adBldgvAPSGtABUCEwLwmczx');
            formData.append('image_file', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype
            });

            const response = await fetch('https://api-us.faceplusplus.com/humanbodypp/v1/gesture', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

            let handGesture = "No hand detected";
            let handRectangle = null;

            if (data.hands && data.hands.length > 0) {
                const gestures = data.hands[0]?.gesture;
                handGesture = Object.keys(gestures).reduce((a, b) =>
                    gestures[a] > gestures[b] ? a : b
                );
                handRectangle = data.hands[0]?.hand_rectangle;
            }
            // Call Text-to-Speech API
            const ttsResponse = await fetch('https://text-to-speach-api.p.rapidapi.com/text-to-speech', {
                method: 'POST',
                headers: {
                    'x-rapidapi-key': 'ea86ec0756msh17e532df1e1c9c9p170c20jsnebad0933d91c',
                    'x-rapidapi-host': 'text-to-speach-api.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: handGesture,
                    lang: 'en',
                    speed: 'slow'
                })
            });

            const audioBuffer = await ttsResponse.buffer();

            // Ensure the audio directory exists
            const audioDir = path.join(__dirname, '../public/audio');
            if (!fs.existsSync(audioDir)) {
                fs.mkdirSync(audioDir, { recursive: true }); 
            }

            // Save the audio file
            const audioFilename = `gesture_audio_${Date.now()}.mp3`;
            const audioPath = path.join(audioDir, audioFilename);
            fs.writeFileSync(audioPath, audioBuffer);

            const audioUrl = `/audio/${audioFilename}`;

            res.render('result', {
                handGesture,
                handRectangle,
                imageUrl: imageBase64,
                audioUrl,
                user
            });

        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Error processing the image');
        }
    }
};

module.exports = gestureController;
