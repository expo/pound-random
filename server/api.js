let clientError = require("./clientError");
let data = require("./data");
let db = require("./db");
let post = require("./post");
let session = require("./session");
let signup = require("./signup");
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
    return await db.queryAsync("SELECT * FROM fake_posts");
  }

  async errorAsync(code, message, props) {
    code = code || "TEST_ERROR";
    message = message || "An example ClientError";
    props = props || { example: true };
    throw clientError(code, message, props);
  }

  async sortOfLoginAsync(username) {
    // Don't do any auth but just give a session for the userId 
    // associated with this username
    let userId = await data.userIdForUsernameAsync(username);
    if (!userId) {
      throw clientError("USERNAME_NOT_FOUND", "No user with the username '" + username + "'", { username });
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
    return await post.newPostAsync(this.context.userId, content, url, replyTo, new Date());
  }

  async deletePostAsync(postId) {
    // For now, you can only delete your own posts
    return await post.deletePostByUserAsync(postId, this.context.userId);
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

module.exports = {
  callMethodAsync,
  shellCallMethodAsync,
  Api,
}
