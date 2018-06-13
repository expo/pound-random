import React from 'react';
import { Button, Text, View } from 'react-native';
import Expo from 'expo';

import Api from '../Api';
import QRCodeUrlReader from '../QRCodeUrlReader';
import FakeLogin from './FakeLogin';
import { TextInput } from 'react-native-gesture-handler';

class Adder extends React.Component {
  state = {
    result: null,
    a: 0,
    b: 0,
  }

  _addAsync = async () => {
    let a = parseInt(this.state.a || '0');
    let b = parseInt(this.state.b || '0');
    let result = await Api.callMethodAsync("add", a, b);
    this.setState({ result });
  }
  componentDidMount() {
    this._addAsync();
  }

  render() {
    let s = {
      fontSize: 30,
      height: 36,
    }
    return (
      <View>
        <TextInput style={s} value={this.state.a + ''} onChangeText={(text) => {
          this.setState({ a: text, });
          this._addAsync();
        }} onSubmitEditing={() => {
          // this.setState({ a: text });
          this._addAsync();
        }} />
        <TextInput style={s} value={this.state.b + ''} onChangeText={(text) => {
          this.setState({ b: text });
          this._addAsync();
        }} onSubmitEditing={(text) => {
          // this.setState({ b: text });
          this._addAsync();
        }} />
        <Text>{this.state.result}</Text>
      </View>
    );
  }
}
export default class MiscSettings extends React.Component {
  render() {
    return (
      <View>
        <Text>This is Misc Settings</Text>
        <QRCodeUrlReader />
        <Button title="Make New Post" onPress={() => {
          this.props.navigation.navigate("NewPost");
        }} />
        <FakeLogin />
        <Adder />

      </View>
    );
  }
}