// Hack that is necessary for some reason :(
if (process.env.RENDER_PRODUCTION) {
  module.exports = require('/etc/secrets/pound-random-secret');
} else {
  module.exports = {};
  // let placesToTry = [
  //   './pound-random-secret',
  //   '../../pound-random-secret',
  //   '/etc/secrets/pound-random-secret',
  // ];

  // let ok = false;

  // for (let p of placesToTry) {
  //   try {
  //     module.exports = require(p);
  //     ok = true;
  //     break;
  //   } catch (e) {
  //     if ((e.code === 'MODULE_NOT_FOUND') || (e.toString().startsWith('Error: Cannot find module'))) {
  //       continue;
  //     } else {
  //       throw e;
  //     }
  //   }
  // }

  // if (!ok) {
  //   throw new Error("Didn't find database configuration. Try cloning https://github.com/expo/pound-random-secret and then symlinking pound-random-secret in the server/ directory to the root of that repo.");
  // }
}