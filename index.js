const fs = require('fs');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const express = require('express');
const app = express();
const port = 8000;

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/', (req, res) => {
    console.log('received a post, body', req.body)
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

const recognize = () => {
    const speechToText = new SpeechToTextV1({
        authenticator: new IamAuthenticator({
            apikey: '37C9T7XWUjYDiG7YyLSsxu_YXtakx6sSjI5JBHXs_ckF',
        }),
        serviceUrl: 'https://api.us-south.speech-to-text.watson.cloud.ibm.com/instances/8e0682de-d7c2-4852-ada0-277fac27f84b',
    });

    const recognizeParams = {
        audio: fs.createReadStream('audio-file.flac'),
        contentType: 'audio/flac',
        wordAlternativesThreshold: 0.9,
        keywords: ['colorado', 'tornado', 'tornadoes'],
        keywordsThreshold: 0.5,
    };

    speechToText.recognize(recognizeParams)
        .then(speechRecognitionResults => {
            console.log(JSON.stringify(speechRecognitionResults, null, 2));
        })
        .catch(err => {
            console.log('error:', err);
        });
}