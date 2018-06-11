import React from "react";
import {
  AsyncStorage,
  Button,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { createStackNavigator, SafeAreaView } from "react-navigation";

import Entry from "./screens/Entry";
import Home from "./screens/Home";

const StackNavigator = createStackNavigator(
  { Entry, Home },
  { initialRouteName: "Entry", headerMode: "none" }
);

export default class App extends React.Component {
  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <StackNavigator persistenceKey="debug" />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
