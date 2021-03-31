const api = require('../utils/api.js');
const yargs = require('yargs');

const argv = yargs
    .command('myself', 'List my user information', () => {}, async (argv) => {
        await api.initialize();
        const response = await api.request('v2/users/me',{
            method: 'GET',
        });
        const body = JSON.parse(response.body);
        console.log(body);
    })
    .command('organizations', 'List my organizations', () => {}, async (argv) => {
        await api.initialize();
        const response = await api.request('v2/organizations',{
            method: 'GET',
        });
        const body = JSON.parse(response.body);
        console.log(body);
    })
    .command('dump_token', 'Dump the token details', () => {}, async (argv) => {
        await api.initialize();
        console.log(api.tokenDetails());
    })
    .demandCommand()
    .help()
    .alias('help', 'h')
    .argv;