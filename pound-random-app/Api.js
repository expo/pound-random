import { AsyncStorage } from "react-native";

let BASE_URL = "http://ec2-34-219-33-58.us-west-2.compute.amazonaws.com:3200/";

// let userId = "user:ccheever";
// let token = "session:user:ccheever/l62BhgIJM8eC7C0mbxo7Qy";

function clientError(code, message, props) {
  let err = new Error(message);
  err.type = "CLIENT_ERROR";
  err.code = code;
  err.props = props;
  return err;
}

export default class Api {
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
    if (response.status == 520) {
      let info = await response.json();
      throw clientError(info.code, info.message, info.props);
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
