let clientError = require("./clientError");
let data = require("./data");
let db = require("./db");
let session = require("./session");
let typedError = require("./typedError");

class Api {

  constructor(context) {
    this.context = context;
  }

  addDoc() {
    return {
      doc: "Adds two numbers together",
      params: ["a: number", "b: number"],
    };
  }

  async addAsync(a, b) {
    return a + b;
  }

  async subtractAsync(a, b) {
    return a - b;
  }

  async fakePostsAsync() {
    return await db.queryAsync("SELECT * FROM fake_posts");
  }

  async errorAsync(code, message, props) {
    code = code || "TEST_ERROR";
    message = message || "An example ClientError";
    props = props || {example: true};
    throw clientError(code, message, props);
  }

  async sortOfLoginAsync(username) {
    // Don't do any auth but just give a session for the userId 
    // associated with this username
    let userId = await data.userIdForUsernameAsync(username);
    if (!userId) {
      throw clientError("USERNAME_NOT_FOUND", "No user with the username '" + username + "'", {username});
    }

    // Make a new session for this user
    let token = await session.newSessionAsync(userId);

    return {
      userId,
      token,
    }
  }

  async logoutSessionAsync() {
    await session.expireSessionAsync(this.context.token);
  }

  __doc__Doc() {
    return {
      doc: "Returns structured documentation for this API",
      params: [],
    };
  }

  async __doc__Async() {
    let methods = {};
    let keys = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      if (k.endsWith("Async")) {
        let m = k.substr(k, k.length - 5);
        let doc = {};
        if (this[m + "Doc"]) {
          doc = this[m + "Doc"]();
        }
        methods[m] = doc;
      }
    }
    return methods;
  }
}

async function callMethodAsync(context, method, args) {
  let a = new Api(context);
  let result = await a[method + "Async"](...args);
  return result;
}

async function shellCallMethodAsync(method, ...args) {
  let context = {
    userId: "user:__shell__",
    token: "session:user:__shell__/repl",
  };

  return await callMethodAsync(context, method, args);
}

module.exports = {
  callMethodAsync,
  shellCallMethodAsync,
  Api,
}
