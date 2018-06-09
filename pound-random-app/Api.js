
let BASE_URL = "http://ec2-34-219-33-58.us-west-2.compute.amazonaws.com:3200/";

export default class Api {
  constructor(context) {
    this.context = context;
  }

  callMethodAsync = async (method, ...args) => {
    let response = await fetch(BASE_URL + "api/" + method, {
      method: "POST",
      body: JSON.stringify(args),
      headers: {
          "Content-Type": "application/json",
      },
    });
    let result = await response.json();
    return result;
  };
}
