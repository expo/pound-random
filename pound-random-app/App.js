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
import MiscSettings from "./screens/MiscSettings";
import NewPost from "./screens/NewPost";

import QRCodeUrlReader from "./QRCodeUrlReader";

const StackNavigator = createStackNavigator(
  { Entry, Home, MiscSettings, NewPost },
  { initialRouteName: "Entry", headerMode: "none" }
);

export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.navigatorRef = React.createRef();
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <StackNavigator ref={this.navigatorRef} persistenceKey="debug" />
        </View>
        <Button title="Go to Misc. Settings Etc." onPress={() => {
          this.navigatorRef.current._navigation.navigate("MiscSettings");
        }} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
