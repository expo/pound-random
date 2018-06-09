let uuidV4 = require("uuid/v4");

function makeUuid() {

  let UUID_LENGTH = 22;
  let UUID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  let bytes = new Array(32);
  uuidV4(null, bytes, 0);
  uuidV4(null, bytes, 16);

  let body = bytes.slice(0, UUID_LENGTH).map(
      byte => UUID_ALPHABET[byte % UUID_ALPHABET.length]
      ).join('');
  return body;
}

module.exports = {
  makeUuid,
};
