let secret = require('./secret');
let Twit = require('twit');

const T = new Twit({
  consumer_key: secret.twitter.apiKey,
  consumer_secret: secret.twitter.apiKeySecret,
  app_only_auth: true,
});

function getTweet(id) {
  return new Promise(function(resolve, reject) {
    T.get('/statuses/show/:id', { id, tweet_mode: 'extended' }, (err, data, response) => {
      if (err) reject(err);
      if (data) resolve(data);
    });
  });
}

module.exports = {
  getTweet,
};
