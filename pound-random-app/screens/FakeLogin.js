import React from 'react';
import { Button, Dimensions, StyleSheet, Text, TextInput, View } from 'react-native';
import Expo from 'expo';

import Api from '../Api'

let { width, height } = Dimensions.get("window");

class UserPicker extends React.Component {
  state = {
    userIdList: null,
    userId: null,
  }

  _selectUserAsync = async (userId) => {
    await Api.selectUserAsync(userId);
    await this._getListOfUsersAsync();
  }

  _getListOfUsersAsync = async () => {
    let sessions = await Api.getAllSessionsAsync();
    let userId = await Api.getUserIdAsync();
    let userIdList = Object.keys(sessions || {});
    this.setState({ userIdList, userId });
  }

  componentDidMount() {
    this._getListOfUsersAsync();
  }

  render() {
    return (
      <View>
        {this.state.userIdList && this.state.userIdList.map((userId) => {
          let s = {};
          let prefix = "";
          let suffix = "";
          if (userId == this.state.userId) {
            s.fontSize = 40;
            s.backgroundColor = 'yellow';
            prefix = "> "; suffix = " <";
            
          }
          return (
            <Button key={userId} title={prefix + userId + suffix} onPress={() => {
              this._selectUserAsync(userId);
            }} style={s} />
          );
        }
        )}
      </View>
    )
  }
}

export default class FakeLogin extends React.Component {

  state = {
    username: null,
    userPickerKey: 0,
  }

  _loginAsync = async () => {
    try {
      let session = await Api.callMethodAsync("sortOfLogin", this.state.username);
      let { userId, token } = session;
      console.log("Logged in as " + userId, session);
      await Api.setSessionAsync(session);
      this.setState({userPickerKey: this.state.userPickerKey + 1});
    } catch (e) {
      if (e.type === 'CLIENT_ERROR') {
        console.warn(e);
      }
    }
  }

  render() {
    return (
      <View style={{
        width,
      }}>
        <Text style={{ fontSize: 28 }}>username</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} style={{
          fontSize: 36,
          borderColor: 'gray',
          borderWidth: 2,
          borderStyle: 'solid',
          height: 50,
        }} onChangeText={(text) => {
          this.setState({ username: text });
        }} />
        <Button
          title="Login"
          disabled={(this.state.username === null)}
          onPress={() => {
            this._loginAsync();
          }} />
        <Text>Or Pick One of These Users</Text>
        <UserPicker key={this.state.userPickerKey} />
      </View >
    );

  }

}