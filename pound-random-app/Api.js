import { AsyncStorage } from "react-native";

import typedError from "./typedError";

// let BASE_URL = "http://ec2-34-219-33-58.us-west-2.compute.amazonaws.com:3200/";
let BASE_URL = "https://pound-random-server.render.com/";
// let BASE_URL = "https://51b62f12.ngrok.io";
// let BASE_URL = "http://192.168.1.124:3200/"

try {
    let serverInfo = require("./serverInfo-generated");
    let BASE_URL = "http://" + serverInfo.lanIpAddress + ":3200/";
    console.log("Using LAN for API at " + BASE_URL);
} catch (e) {
  console.log("No LAN URL found; using master server at " + BASE_URL);
}


function clientError(code, message, props) {
  let err = new Error(message);
  err.type = "CLIENT_ERROR";
  err.code = code;
  err.props = props;
  return err;
}

class Api {
  constructor(context) {
    this.context = context;
  }

  callMethodAsync = async (method, ...args) => {
    let token = await this.getSessionAsync();
    let response = await fetch(BASE_URL + "api/" + method, {
      method: "POST",
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json",
        "X-PoundRandom-Auth-Token": token
      }
    });
    if (response.status === 520) {
      let info = await response.json();
      throw clientError(info.code, info.message, info.props);
    } else if (response.status === 400) {
      let info = await response.json();
      let e = typedError("BAD_API_REQUEST", info.message);
      e.code = info.code;
      e.props = info.props;
      throw e;
    } else if (response.status !== 200) {
      let sa = JSON.stringify(args);
      sa = sa.substr(1, sa.length - 2);
      let callsig = method + "(" +  sa + ")";
      throw typedError("UNEXPECTED_API_STATUS_CODE", "Unexpected API status code: " + response.status + " when trying to call " + callsig);
    }
    let result = await response.json();
    return result;
  };

  storeSessionAsync = async session => {
    await AsyncStorage.setItem("session", session);
  };

  getSessionAsync = async () => {
    return await AsyncStorage.getItem("session");
  };
}

let api = new Api();
export default api;
