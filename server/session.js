let compactUuid = require("./compactUuid");

let data = require("./data");

function makeToken(userId) {
  return "session:" + userId + "/" + compactUuid.makeUuid();
}

async function newSessionAsync(userId) {
  let token = makeToken(userId);
  await data.createSessionAsync(userId, token);
  return token;
}

async function expireSessionAsync(token) {
  await data.deleteSessionAsync(token);
}

module.exports = {
  newSessionAsync,
  expireSessionAsync,
  makeToken,
}

