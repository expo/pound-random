let data = require("./data");
let db = require("./db");
let typedError = require("./typedError");

class Api {

  constructor(context) {
    this.context = context;
  }

  async addAsync(a, b) {
    return a + b;
  }

  async fakePostsAsync() {
    return await db.queryAsync("SELECT * FROM fake_posts");
  }

  async errorAsync() {
    throw typedError("TEST_ERROR", "This is a test");
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
  };

  return await callMethodAsync(context, method, args);
}

module.exports = {
  callMethodAsync,
  shellCallMethodAsync,
}
