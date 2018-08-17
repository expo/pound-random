let db = require('./db');
let data = require('./data');

async function getEmotes() {
  let results = await db.queryAsync('SELECT * FROM emote');

  return results;
}

async function writeEmoteAsync(name, uri) {
  const result = await data.writeNewObjectAsync({ name, uri }, 'emote');

  return result;
}

module.exports = {
  getEmotes,
  writeEmoteAsync,
};
