let db = require('./db');
let data = require('./data');
let Expo = require('expo-server-sdk');

let expo = new Expo();

async function tokenExistsAsync(userId) {
  let result = await db.queryAsync('SELECT userId FROM pushNotificationToken WHERE userId = ?', [
    userId,
  ]);
  return result.length > 0;
}

async function getTokenAsync(userId) {
  let result = await db.queryAsync('SELECT * FROM pushNotificationToken WHERE userId = ?', [
    userId,
  ]);

  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}

async function writeTokenAsync(userId, token) {
  if (!Expo.isExpoPushToken(token)) {
    throw new Error(`Push token ${pushToken} is not a valid Expo push token`);
  }
  const result = await data.writeNewObjectAsync({ userId, token }, 'pushNotificationToken', {
    replace: true,
  });

  return result;
}

async function sendNotificationAsync(userIds, body, postId) {
  const env = process.env.NODE_ENV || 'dev';

  if (env !== 'dev') {
    let messages = [];
    for (let userId of userIds) {
      await data.writeNewObjectAsync({ postId, userId, body }, 'notification', {
        replace: true,
      });

      const result = await getTokenAsync(userId);

      if (!result) continue;

      const { token } = result;

      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: token,
        sound: 'default',
        body,
        data: { postId },
      });
    }

    let chunks = expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

function _getRegexMention() {
  return new RegExp(
    /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/_]{1,15})(?:\b(?!@|＠)|$)/gim
  );
}
function _getRegexHashtag() {
  return new RegExp(/(?:^|[^a-zA-Z0-9_])(?:(?:#)(?!\/))([a-zA-Z0-9/_]+)(?:\b(?!#)|$)/gim);
}
function _unique(arr) {
  return arr.filter((val, i, _arr) => _arr.indexOf(val) === i);
}

const extract = (text, options) => {
  if (options && typeof options === 'string') {
    options = { type: options };
  }

  options = options || {};
  options.type = options.type || '@';

  const regex =
    options.type === '@'
      ? _getRegexMention()
      : options.type === '#'
        ? _getRegexHashtag()
        : options.type.toLowerCase() === 'all'
          ? _getRegexMention()
          : null;

  if (!regex) throw new Error(`Type ${options.type} is not valid`);

  if (options.type.toLowerCase() === 'all') {
    const result = {
      mentions: extract(text, {
        type: '@',
        unique: options.unique,
        symbol: options.symbol,
      }),
      hashtags: extract(text, {
        type: '#',
        unique: options.unique,
        symbol: options.symbol,
      }),
    };

    return result;
  } else {
    const results = (text.match(regex) || []).map((result) => {
      result = result.replace(/ |\./g, '');
      if (options.symbol !== undefined && options.symbol === false)
        return result.replace(/^(@|#)/, '');

      return result;
    });

    return options.unique ? _unique(results) : results;
  }
};

module.exports = {
  tokenExistsAsync,
  getTokenAsync,
  writeTokenAsync,
  sendNotificationAsync,
  extract,
};
