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

import Entry from "./screens/Entry";
import Home from "./screens/Home";

const StackNavigator = createStackNavigator(
  { Entry, Home },
  { initialRouteName: "Entry", headerMode: "none" }
);

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <StackNavigator />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
