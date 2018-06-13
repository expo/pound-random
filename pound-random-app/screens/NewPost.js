import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import Expo from 'expo';

import Api from "../Api";

export default class NewPost extends React.Component {

  state = {
    text: '',
  }

  _submitAsync = async () => {
    try {
      await Api.callMethodAsync("createPost", { content: this.state.text, url: null, replyTo: null });
      this.props.navigation.navigate("Home");
    } catch (e) {
      if (e.type === "CLIENT_ERROR") {
        console.warn("Error: " + e);
        // Where should we go?
        // this.props.navigation.navigate("MiscSettings");
      }
    }
  }

  render() {
    return (

      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text>New Post</Text>
        <TextInput style={{
          width: 400,
          height: 400,
        }} onChangeText={(text) => {
          this.setState({ text });
        }} />
        <Button title="Submit" onPress={() => {
          this._submitAsync();
        }} />
      </View>
    );
  }

}
