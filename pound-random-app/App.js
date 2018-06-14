import React from "react";
import {
  AsyncStorage,
  Button,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  View
} from "react-native";
import { createStackNavigator, SafeAreaView } from "react-navigation";
import { FluidNavigator } from "react-navigation-fluid-transitions";
import Entry from "./screens/Entry";
import Home from "./screens/Home";
import Thread from "./screens/Thread";
import MiscSettings from "./screens/MiscSettings";
import NewPost from "./screens/NewPost";

import QRCodeUrlReader from "./QRCodeUrlReader";

const StackNavigator = FluidNavigator(
  { Entry, Home, MiscSettings, NewPost, Thread },
  {
    initialRouteName: "Entry",
    headerMode: "none",
    mode: "card"
  }
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
          <StackNavigator ref={this.navigatorRef} />
        </View>
        <DebugButton
          onPress={() => {
            if (
              this.navigatorRef.current._navigation.state.routes[
                this.navigatorRef.current._navigation.state.index
              ].routeName === "MiscSettings"
            ) {
              this.navigatorRef.current._navigation.navigate("Home");
            } else {
              this.navigatorRef.current._navigation.navigate("MiscSettings");
            }
          }}
        />
      </SafeAreaView>
    );
  }
}

const DebugButton = ({ onPress }) => (
  <TouchableOpacity
    style={{
      height: 64,
      width: 64,
      borderRadius: 32,
      backgroundColor: "palevioletred",
      position: "absolute",
      bottom: 96,
      right: 32,
      justifyContent: "center",
      alignItems: "center"
    }}
    onPress={onPress}
  >
    <Text>🐛</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
