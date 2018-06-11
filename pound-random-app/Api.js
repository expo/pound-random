import { AsyncStorage } from "react-native";

import typedError from "./typedError";

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
    let BASE_URL = await getBaseUrlAsync();
    let sa = JSON.stringify(args);
    sa = sa.substr(1, sa.length - 2);
    let callsig = method + "(" + sa + ")";
    console.log("API: " + callsig);
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
      throw typedError(
        "UNEXPECTED_API_STATUS_CODE",
        "Unexpected API status code: " +
          response.status +
          " when trying to call " +
          callsig
      );
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

export async function getBaseUrlAsync() {
  let BASE_URL = await AsyncStorage.getItem("BASE_URL");
  BASE_URL = BASE_URL || "https://pound-random-server.render.com/";
  return BASE_URL;

}

let api = new Api();
export default api;
