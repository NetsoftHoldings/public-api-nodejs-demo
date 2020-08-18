const express = require('express');
const api = require('../utils/api');
const router = express.Router();

/* GET organizations listing. */
router.get('/', async function (req, res, next) {
    const response = await api.request({
        method: 'GET',
        json: true,
        url: 'v2/organizations',
    });
    const body = response.body;
    res.render('organizations', {
        title: 'Organization list',
        organizations: body.organizations || []
    });
});

module.exports = router;
