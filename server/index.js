const Raven = require('raven');

Raven.config('https://18d60d1b370f4b0a9b49d395802e1495@sentry.io/1244337').install();

let time = require('./time');
if (require.main === module) {
  time.start('server-start');
}

let util = require('util');

let bodyParser = require('body-parser');
let express = require('express');
let ip = require('ip');
let moment = require('moment');
let qrcodeTerminal = require('qrcode-terminal');
let qrcode = require('qrcode');
let spawnAsync = require('@expo/spawn-async');

let clientError = require('./clientError');
let api = require('./api');
let session = require('./session');

const { GraphQLServer, PubSub } = require('graphql-yoga');
const { graphqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

const pubsub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });

server.express.use(
  '/http',
  bodyParser.json(),
  graphqlExpress({ schema: makeExecutableSchema({ typeDefs, resolvers }) })
);

let port;
if (process.env.NODE_ENV === 'production') {
  port = 80;
} else {
  port = 3200;
}
port = process.env.PORT || port;

function getMyLanUrl() {
  let addr = ip.address();
  let lanUrl = 'http://' + addr;
  if (port !== 80) {
    lanUrl += ':' + port;
  }
  lanUrl += '/';
  return lanUrl;
}

let _apiStats = {
  requests: 0,
  success: 0,
  apiError: 0,
  serverError: 0,
  // clientError: 0,
};

if (require.main === module) {
  server.start({ port }, () => {
    let lanUrl = getMyLanUrl();
    console.log(`Server is running at ${lanUrl}`);
    _apiStats.startTime = Date.now();
    if (process.stdout.isTTY) {
      qrcodeTerminal.generate(lanUrl);
    }
    time.end('server-start');
  });
}
