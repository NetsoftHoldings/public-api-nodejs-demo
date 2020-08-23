const express = require('express');
const api = require('../utils/api');
const router = express.Router();

/* GET organizations listing. */
router.get('/', async function (req, res, next) {
    const response = await api.request('v2/web_tokens/pages', {
        method: 'GET',
        json: true,
    });
    const body = JSON.parse(response.body);
    res.render('web_tokens', {
        title: 'Web tokens demo',
        data: body
    });
});

router.post('/test', async function (req, res, next) {
    if (!req.body.organization_id || !req.body.user_id) {
        res.json({error: 'Must specify organization_id and user_id'});
    } else {
        const response = await api.request('v2/web_tokens', {
            method: 'POST',
            json: {
                pages: [
                    {
                        page: req.body.page,
                        params: {
                            organization_id: req.body.organization_id,
                        },
                    },
                ],
                user_id: req.body.user_id,
                session_duration: 60 * 2,
            }
        });
        const body = JSON.parse(response.body);
        res.redirect(body.url, 302);
    }
})

module.exports = router;
