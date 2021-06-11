const fs = require('fs');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 80;

app.use(fileUpload());

app.get('/api', (req, res) => {
    res.send('Hello World!')
});

app.post('/api/uploadFile', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv( __dirname + '/audios/' + 'temp.mp3', async (err) => {
        if (err)
            return res.status(500).send(err);

        const response = await recognize();

        res.status(200).send(response);
    });
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

const recognize = async () => {
    const speechToText = new SpeechToTextV1({
        authenticator: new IamAuthenticator({
            apikey: '37C9T7XWUjYDiG7YyLSsxu_YXtakx6sSjI5JBHXs_ckF',
        }),
        serviceUrl: 'https://api.us-south.speech-to-text.watson.cloud.ibm.com/instances/8e0682de-d7c2-4852-ada0-277fac27f84b',
    });

    const recognizeParams = {
        audio: fs.createReadStream('audios/temp.mp3'),
        contentType: 'audio/mp3',
        wordAlternativesThreshold: 0.9
    };

    const result = await speechToText.recognize(recognizeParams);
    return result.result;
}