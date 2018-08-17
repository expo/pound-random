let twilite = require("twilite");
let secret = require("./secret");

module.exports = twilite(secret.twilio);
