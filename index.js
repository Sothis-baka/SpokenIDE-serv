const fs = require('fs');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const AssistantV2 = require('ibm-watson/assistant/v2');

const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 80;

app.use(cors())
app.use(fileUpload());

const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
        apikey: '37C9T7XWUjYDiG7YyLSsxu_YXtakx6sSjI5JBHXs_ckF',
    }),
    serviceUrl: 'https://api.us-south.speech-to-text.watson.cloud.ibm.com/instances/8e0682de-d7c2-4852-ada0-277fac27f84b',
});

const assistant = new AssistantV2({
    version: '2020-04-01',
    authenticator: new IamAuthenticator({
        apikey: 'abDuxiF0X6RFS67nwOsVSggBq0uiRgEAssuzqLx-9zjA',
    }),
    serviceUrl: 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/e0ef648b-38f9-43e3-b4a9-0f0773e97094',
});

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

        // If it's not undefined, continue to next step.
        if(!response){
            return res.status(200).send(undefined);
        }

        const result = await fetchMessage(response);

        res.status(200).send(result);
    });
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

const recognize = async () => {
    const recognizeParams = {
        audio: fs.createReadStream('audios/temp.mp3'),
        contentType: 'audio/mp3',
        wordAlternativesThreshold: 0.9
    };

    const result = await speechToText.recognize(recognizeParams);
    return result.result?.results[0]?.alternatives[0]?.transcript;
}

const fetchMessage = async (msg) => {
    const result = await assistant.messageStateless({
        assistantId: '6213741c-8276-4b5e-a9a9-10f318472033',
        input: {
            'message_type': 'text',
            'text': msg
        }
    })

    console.log(msg);

    return (result.result?.output?.generic[0].text);
}