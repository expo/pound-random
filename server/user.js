let data = require("./data");
let db = require("./db");

async function multigetUsersAsync(userIdList) {
  return await data.multigetObjectsAsync(userIdList, 'user');
}

async function getUserAsync(userId) {
  return data.getObjectAsync(userId, 'user');
}

async function userIdForNormalizedUsernameAsync(normalizedUsername) {
  let result = await db.queryAsync("SELECT userId FROM user WHERE normalizedUsername = ?", [normalizedUsername]);
  if (result.length > 0) {
    return result[0].userId;
  }
}

module.exports = {
  getUserAsync,
  multigetUsersAsync,
  userIdForNormalizedUsernameAsync,
}