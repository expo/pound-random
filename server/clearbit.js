let clearbit = require('clearbit');
let secret = require('./secret');
module.exports = clearbit(secret.clearbit.apiKey);
