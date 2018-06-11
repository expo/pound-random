import { Button, Text, TextInput, View, StyleSheet } from "react-native";
import React from "react";

import Api from "../Api";
import Signup from "../Signup";

export default class Login extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    username: "",
    mobileNumber: ""
  };

  render() {
    return (
      <View style={styles.container}>
        {/* <Text style={styles.appName}>#Random</Text> */}
        <View style={styles.thisWouldBeALogoOrIcon} />

        <View style={styles.formContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="enter username"
            keyboardType="phone-pad"
            onChangeText={text => {
              this.setState(state => ({ mobileNumber: text }));
            }}
          />
          <TextInput
            style={styles.textInput}
            placeholder="enter phone number"
            keyboardType="phone-pad"
            onChangeText={text => {
              this.setState(state => ({ mobileNumber: text }));
            }}
          />
          <Button
            title="Sign Up / Log In"
            onPress={() => {
              this.props.navigation.navigate("Home");
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16
  },
  formContainer: {
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center"
  },
  textInput: {
    fontSize: 24,
    paddingHorizontal: 32,
    textAlign: "center",
    paddingVertical: 12,
    width: "100%",
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.1)"
  },
  appName: {
    fontSize: 64,
    borderRadius: 12,
    color: "black",
    textAlign: "center"
  },
  thisWouldBeALogoOrIcon: {
    height: 128,
    width: 128,
    borderRadius: 64,
    backgroundColor: "palevioletred"
  }
});
