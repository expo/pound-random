import { Button, Text, TextInput, View, StyleSheet } from "react-native";
import React from "react";

import Api from "../Api";
import Signup from "../Signup";

export default class Login extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    username: "",
    mobileNumber: "",
  };

  _sortOfSignupAsync = async () => {
    try {
      let result = await Api.callMethodAsync("sortOfSignup", {
        username: this.state.username,
        mobileNumber: this.state.mobileNumber,
      });
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    let s = {
      fontSize: 40,
    };

    return (
      <View style={styles.container}>
        <Text>username</Text>
        <TextInput
          style={s}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="enter username"
          value={this.state.username}
          onChangeText={text => {
            this.setState({ username: text });
          }}
        />
        <Text>mobile number</Text>
        <TextInput
          keyboardType="phone-pad"
          style={s}
          placeholder="enter mobile number"
          value={this.state.mobileNumber}
          onChangeText={text => {
            this.setState({ mobileNumber: text });
          }}
        />
        <Button
          title="Signup"
          onPress={() => {
            this.props.navigation.replace("Home");
            // this._sortOfSignupAsync();
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  textInput: {
    fontSize: 40,
  },
});
