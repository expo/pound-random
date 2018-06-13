let placesToTry = [
  '../../pound-random-secret',
  '/etc/secrets/pound-random-secret',
];

let ok = false;

for (let p of placesToTry) {
  try {
    module.exports = require(p);
    ok = true;
    break;
  } catch (e) {
    if ((e.code === 'MODULE_NOT_FOUND') || (e.toString().startsWith('Error: Cannot find module'))) {
      continue;
    } else {
      throw e;
    }
  }
}

if (!ok) {
  throw new Error("Didn't find database configuration. Try cloning https://github.com/expo/pound-random-secret into the same parent directory that the pound-random project is in.");
}