let clientError = require("./clientError");
let data = require("./data");
let db = require("./db");
let links = require("./links");
let post = require("./post");
let session = require("./session");
let signup = require("./signup");
let typedError = require("./typedError");
let user = require("./user");
let username = require("./username");

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

  async __contextAsync() {
    return this.context;
  }

  async whoAmIAsync() {
    let userId = this.context.userId;
    return await user.getUserAsync(userId);
  }


  async newPostAsync({ content, url, replyTo }) {
    let userId = this.context.userId;
    let postId = await post.newPostAsync(userId, content, url, replyTo);
    return postId;
  }

  async infoForLinkAsync(url) {
    return await links.infoForLinkAsync(url);
  }

  async getPostAsync(postId) {
    return post.getPostAsync(postId);
  }

  async feedAsync() {
    return await post.buildFeedAsync();
  }


  sortOfSignupDoc() {
    return {
      doc: "Proto signup",
      params: [{ "username": "string", "mobileNumber": "string" }],
    }
  }

  async sortOfSignupAsync({ username, mobileNumber }) {
    return await signup.signupUserAsync(username, mobileNumber);
  }

  async fakePostsAsync() {
    return [];
    // return await db.queryAsync("SELECT * FROM fake_posts");
  }

  async errorAsync(code, message, props) {
    code = code || "TEST_ERROR";
    message = message || "An example ClientError";
    props = props || { example: true };
    throw clientError(code, message, props);
  }

  async sortOfLoginAsync(rawUsername) {
    // Don't do any auth but just give a session for the userId 
    // associated with this username
    let normalizedUsername = username.normalizeUsername(rawUsername);
    let userId = await user.userIdForNormalizedUsernameAsync(normalizedUsername);
    if (!userId) {
      throw clientError("USERNAME_NOT_FOUND", "No user with the username '" + rawUsername + "'", { rawUsername, normalizedUsername });
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

  async createPostAsync({ content, url, replyTo }) {
    let userId = this.context.userId;
    if (!userId) {
      throw clientError("LOGIN_REQUIRED", "Login required to post");
    }
    return await post.newPostAsync(userId, content, url, replyTo, new Date());
  }

  async deletePostAsync(postId) {
    // For now, you can only delete your own posts
    return await post.deletePostByUserAsync(postId, this.context.userId);
  }

  async addAsync(a, b) {
    return a + b;
  }

  async subtractAsync(a, b) {
    return a - b;
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
  let m = method + "Async";
  if (!a[m]) {
    throw typedError("API_ERROR", "No such method '" + m + "'");
  }
  let result = await a[m](...args);
  return result;
}

async function shellCallMethodAsync(method, ...args) {
  let context = {
    userId: "user:__shell__",
    token: "session:user:__shell__/repl",
  };

  return await callMethodAsync(context, method, args);
}

let shell = (() => {
  let a = new Api({
    userId: "user:__shell__",
    token: "session:user:__shell__/repl",
  });
  let shell = (context) => {
    a.context = { ...a.context, ...context };
    return shell;
  }

  let keys = Object.getOwnPropertyNames(Object.getPrototypeOf(a));
  for (k of keys) {
    ((k) => {
      if (k.endsWith("Async")) {
        let m = k.substr(0, k.length - 5);
        shell[k] = (...args) => {
          return a[k](...args);
        }
      }
    })(k);
  }

  return shell;

})();

module.exports = {
  callMethodAsync,
  shellCallMethodAsync,
  Api,
  shell,
}
