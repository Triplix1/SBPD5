const express = require('express');
const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const axios = require('axios');
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const checkJwt = auth({
    audience: 'https://dev-pxu5guvclvdrtofv.us.auth0.com/api/v2/',
    issuerBaseURL: `https://dev-pxu5guvclvdrtofv.us.auth0.com/`,
});

// This route doesn't need authentication
app.get('/public', function (req, res) {
    res.json({
        message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'
    });
});

// This route needs authentication
app.get('/private', checkJwt, function (req, res) {
    res.json({
        message: 'Hello from a private endpoint! You need to be authenticated to see this.'
    });
});


app.get('/', (req, res) => {
    const token = req.headers.authorization
    if (token) {
        return res.json({
            username: token,
        })
    }
    res.sendFile(path.join(__dirname + '/indexjwt.html'));
})

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;

    console.log(login);
    console.log(password);
    try {
        const authResponse = await axios.post('https://dev-pxu5guvclvdrtofv.us.auth0.com/oauth/token', {
            grant_type: 'password',
            client_id: '8QQ2JA42CH2SfDkDr4dazIMM3m9Knlts',
            client_secret: 'MoW5uQraDzk9nsSDWVSH5xC5IIuQW25NXaDTA0bd2iV0uMRgivK_rdzKvJNIeVgc',
            audience: 'https://dev-pxu5guvclvdrtofv.us.auth0.com/api/v2/',
            username: login,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const { access_token } = authResponse.data;

        res.json({ token: access_token });
    } catch (error) {
        console.error('Authentication failed:', error);
        res.status(401).send('Authentication failed');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
