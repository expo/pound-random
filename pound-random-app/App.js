import React from "react";
import {
  AsyncStorage,
  Button,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createStackNavigator } from "react-navigation";

import Login from "./screens/Login";
import Home from "./screens/Home";

const StackNavigator = createStackNavigator(
  { Login, Home },
  { initialRouteName: "Login", headerMode: "none" }
);

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <StackNavigator />
        <StatusBar barStyle="dark-content" />
         <SortOfLogin />
      </View>
    )
  }
}

class SortOfLogin extends React.Component {
  state = {
    username: null
  };

  _submitAsync = async () => {
    let result = await Api.callMethodAsync("sortOfLogin", this.state.username);
    await api.storeSessionAsync(result.token);
    console.log(result);
  };

  render() {
    return (
      <View
        style={{
          marginBottom: 50
        }}
      >
        <Text>Username:</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={this.state.username}
          onChangeText={text => {
            this.setState({ username: text });
          }}
          onSubmitEditing={() => {
            this._submitAsync();
          }}
        />
        <Button
          title="Login"
          onPress={() => {
            this._submitAsync();
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
