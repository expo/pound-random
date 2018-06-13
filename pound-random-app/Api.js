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
    let session = await this.getSessionAsync();
    let headers = {
      "Content-Type": "application/json",
    };
    if (session) {
      let { token, userId } = session;
      headers["X-PoundRandom-Auth-Token"] = token;
      headers["X-PoundRandom-UserId"] = userId;
    }

    let response = await fetch(BASE_URL + "api/" + method, {
      method: "POST",
      body: JSON.stringify(args),
      headers,
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

  setSessionAsync = async (session) => {
    let userId = session.userId;
    if (!userId) {
      throw new Error("No userId associated with session", { session });
    }

    let x = {};
    x[userId] = session;
    try {
      await AsyncStorage.mergeItem("sessions", JSON.stringify(x));
    } catch (e) {
      // If this barfs for some other reason than there being not-a-JSON-object under "sessions",
      // then this could logout people, but we can deal with that later.
      // The fix is to verify that the error is because the data can't be merged, not bc of 
      // an intermittent failure or something
      await AsyncStorage.setItem("sessions", JSON.stringify(x));
    }
    await AsyncStorage.setItem("userId", JSON.stringify(userId));

    return session;
  };

  getAllSessionsAsync = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem("sessions"));
    } catch (e) {
      return {};
    }
  }

  getSessionAsync = async () => {

    let userId = null;
    let sessions = {};
    try {
      userId = JSON.parse(await AsyncStorage.getItem("userId"));
    } catch (e) {
      console.warn("Trouble fetching userId from AsyncStorage");
    }

    try {
      sessions = JSON.parse(await AsyncStorage.getItem("sessions"));
    } catch (e) {
      console.warn("Trouble fetching sessions from AsyncStorage");
    }

    let s = null;
    if (sessions) {
      s = sessions[userId];
    }
    return s;
  };

  getUserIdAsync = async () => {
    // Get this from the session rather than from AsyncStorage because its only 
    // valid if there's a session for it
    let s = await this.getSessionAsync();
    if (s) {
      return s.userId;
    }
  }

  selectUserAsync = async (userId) => {
    await AsyncStorage.setItem("userId", JSON.stringify(userId));
  }
}

export async function getBaseUrlAsync() {
  let BASE_URL = await AsyncStorage.getItem("BASE_URL");
  BASE_URL = BASE_URL || "https://pound-random-server.render.com/";
  return BASE_URL;

}

let api = new Api();
export default api;
