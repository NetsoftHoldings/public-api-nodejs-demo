const {Issuer, TokenSet} = require('openid-client');
const debug = require('debug')('public-api-demo:api');
const fs = require('fs');
const jose = require('jose');

// constants
const ISSUER_EXPIRE_DURATION = 7 * 24 * 60 * 60; // 1 week
const ACCESS_TOKEN_EXPIRATION_FUZZ = 30; // 30 seconds
const ISSUER_DISCOVERY_URL = 'https://account.hubstaff.com';
// API URl with trailing slash
const API_BASE_URL = 'https://api.hubstaff.com/';

let state = {
    api_base_url: API_BASE_URL,
    issuer_url: ISSUER_DISCOVERY_URL,
    issuer: {}, // The issuer discovered configuration
    issuer_expires_at: 0,
    token: {},
};
let client;

function loadState() {
    return fs.readFileSync('./configState.json', 'utf8');
}

function saveState() {
    fs.writeFileSync('./configState.json', JSON.stringify(state, null, 2), 'utf8');
    debug('State saved');
}

function unixTimeNow() {
    return Date.now() / 1000;
}

async function checkToken() {
    if (!state.token.access_token || state.token.expires_at < (unixTimeNow() + ACCESS_TOKEN_EXPIRATION_FUZZ)) {
        debug('Refresh token');
        state.token = await client.refresh(state.token);
        debug('Token refreshed');
        saveState();
    }
}

async function initialize() {
    debug('Initializing API');
    let data = loadState();
    data = JSON.parse(data);
    if (data.issuer) {
        state.issuer = new Issuer(data.issuer);
        state.issuer_expires_at = data.issuer_expires_at;
    }
    if (data.token) {
        state.token = new TokenSet(data.token);
    }
    if (data.issuer_url) {
        state.issuer_url = data.issuer_url;
    }
    if (data.api_base_url) {
        state.api_base_url = data.api_base_url;
    }

    if (!state.issuer_expires_at || state.issuer_expires_at < unixTimeNow()) {
        debug('Discovering');
        state.issuer = await Issuer.discover(state.issuer_url);
        state.issuer_expires_at = unixTimeNow() + ISSUER_EXPIRE_DURATION;
        debug(state.issuer);
    }
    client = new state.issuer.Client({
        // For personal access token we can use PAT/PAT.
        // This is only needed because the library requires a client_id where as the API endpoint does not require it
        client_id: 'PAT',
        client_secret: 'PAT',
    });
    saveState();
    debug('API initialized');
}

async function request(url, options) {
    await checkToken();

    let fullUrl = state.api_base_url + url;

    return client.requestResource(fullUrl, state.token, options);
}

function tokenDetails() {
    let ret = {};

    if (state.token.access_token) {
        ret.access_token = jose.JWT.decode(state.token.access_token);
    }
    if (state.token.refresh_token) {
        ret.refresh_token = jose.JWT.decode(state.token.refresh_token);
    }

    return ret;
}

module.exports = {
    initialize,
    checkToken,
    request,
    tokenDetails,
};

