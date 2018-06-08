let data = require("./data");
let typedError = require("./typedError");

class Api {

  constructor(context) {
    this.context = context;
  }

  async addAsync(a, b) {
    return a + b;
  }
}

async function callMethodAsync(context, method, args) {
  if (method.startsWith("_")) {
    throw typedError("API_NOT_ALLOWED", "Can't call methods that start with _");
  }

  // TODO: Maybe move this somewhere else?
  // Or don't do this?
  let ctx2 = {...context};
  if (ctx2.userId) {
    ctx2.user = await data.getUserByIdAsync(context.userId);
  }

  let a = new Api(ctx2);
  //console.log("method=", method, "args=", args);
  let result = await a[method + "Async"](...args);
  return result;

}

async function shellCallMethodAsync(method, ...args) {
  let context = {
    userId: "user:shell",
  };

  return await callMethodAsync(context, method, args);
}

module.exports = {
  callMethodAsync,
  shellCallMethodAsync,
}
