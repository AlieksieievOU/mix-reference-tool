require('dotenv').config();
const express = require('express');
const https = require('https'); // 1. Import the 'https' module
const fs = require('fs'); // 2. Import the 'fs' module
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

const app = express();
const port = 8888; // Backend runs on a different port

// 3. Read the SSL certificate files
const sslOptions = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
};

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const FRONTEND_URI = process.env.FRONTEND_URI;
const stateKey = 'spotify_auth_state';

app.use(express.json());
app.use(cors({ origin: FRONTEND_URI, credentials: true }));
app.use(cookieParser());

// ... (the rest of your routes: generateRandomString, /login, /callback) ...
const generateRandomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);

    const scope = 'user-read-private user-read-email streaming';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            state: state,
        }));
});

app.get('/auth/external/callback', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect(`${FRONTEND_URI}/#${querystring.stringify({ error: 'state_mismatch' })}`);
    } else {
        res.clearCookie(stateKey);
        try {
            const response = await axios({
                method: 'post',
                url: 'https://accounts.spotify.com/api/token',
                data: querystring.stringify({
                    code: code,
                    redirect_uri: REDIRECT_URI,
                    grant_type: 'authorization_code'
                }),
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                },
            });

            const { access_token, refresh_token, expires_in } = response.data;
            // Pass tokens to the frontend via query params for simplicity
            res.redirect(`${FRONTEND_URI}/?${querystring.stringify({ access_token, refresh_token, expires_in })}`);

        } catch (error) {
            res.redirect(`${FRONTEND_URI}/#${querystring.stringify({ error: 'invalid_token' })}`);
        }
    }
});


// 4. Create an HTTPS server and have it listen on the port
https.createServer(sslOptions, app).listen(port, () => {
    console.log(`Backend server listening at https://localhost:${port}`);
});