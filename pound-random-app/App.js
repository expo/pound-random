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

let SERVER_ROOT =
  "http://ec2-34-219-33-58.us-west-2.compute.amazonaws.com:3200";

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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
