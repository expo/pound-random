let compactUuid = require("./compactUuid");

let data = require("./data");
let db = require("./db");

function makeToken(userId) {
  return "session:" + userId + "/" + compactUuid.makeUuid();
}

async function newSessionAsync(userId) {
  let token = makeToken(userId);
  await createSessionAsync(userId, token);
  return token;
}

async function expireSessionAsync(token) {
  await deleteSessionAsync(token);
}

async function userIdForTokenAsync(token) {
  let result = await db.queryAsync("SELECT userId FROM session WHERE token = ?", [token]);
  if (result.length > 0) {
    return result[0].userId;
  }
}

async function createSessionAsync(userId, token) {
  let result = data.writeNewObjectAsync({userId, token}, 'session');
  return token;
}

async function deleteSessionAsync(token) {
  await db.queryAsync("DELETE FROM session WHERE token = ?", [token]);
}



module.exports = {
  newSessionAsync,
  expireSessionAsync,
  makeToken,
  userIdForTokenAsync,
}

