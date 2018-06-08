let typedError = require("./typedError");

class Api {

  constructor(context) {
    Object.assign(this, context);
  }

}

async function callMethodAsync(context, method, args) {
  if (method.startsWith("_")) {
    throw typedError("API_NOT_ALLOWED", "Can't call methods that start with _");
  }
 
  let a = new Api(context);
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
