import Backend from './public/js/Backend.js';

import 'dotenv/config.js';


const dropboxConfig = {
    accessToken: process.env.DROPBOX_API_KEY,
    fetch: fetch
};

const sessionConfig = {
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}


const backend = new Backend(dropboxConfig, sessionConfig);
backend.start();
