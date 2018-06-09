import { Button, Text, TextInput, View } from 'react-native';
import React from 'react';

import Api from "./Api";

export default class Signup extends React.Component {

  state = {
    username: '',
    mobileNumber: '',
  }

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
  }

  render() {

    let s = {
      fontSize: 40,
    }

    return (
      <View>
        <Text>username</Text>
        <TextInput style={s}
          autoCapitalize="none"
          autoCorrect={false} value={this.state.username} onChangeText={(text) => {
            this.setState({ username: text });
          }} />
        <Text>mobile number</Text>
        <TextInput keyboardType="phone-pad" style={s} value={this.state.mobileNumber} onChangeText={(text) => {
          this.setState({ mobileNumber: text });
        }} />
        <Button title="Signup" onPress={() => {
          this._sortOfSignupAsync();
        }} />
      </View>
    )

  }

}