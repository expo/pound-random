import React from "react";
import {
  Button,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ImageBackground
} from "react-native";
import { LinearGradient } from "expo";

class FeedPost extends React.Component {
  state = {
    imageIsLoaded: false
  };

  randomBit = Math.random();

  render() {
    return (
      <TouchableOpacity>
        <ImageBackground
          onLoad={() => {
            this.setState({ imageIsLoaded: true });
          }}
          source={{
            uri: `https://picsum.photos/${
              Dimensions.get("window").width
            }/80/?random=${this.randomBit}`
          }}
          style={{ width: "100%", height: 80 }}
        >
          {this.state.imageIsLoaded ? (
            <LinearGradient
              colors={["rgba(0,0,0,0.4)", "transparent"]}
              style={{
                flex: 1,
                position: "absolute",
                height: "100%",
                width: "100%"
              }}
            />
          ) : null}

          <View style={{ width: "100%", height: 80, padding: 16 }}>
            <Text style={{ color: "white" }}>This is a FeedPost</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }
}

const Separator = () => <View style={{ height: 8 }} />;

export default class Home extends React.Component {
  static navigationOptions = {
    header: null
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={{ flex: 1, width: "100%" }}
          data={[{ key: "a" }, { key: "b" }, { key: "c" }]}
          renderItem={({ item }) => <FeedPost />}
          ItemSeparatorComponent={Separator}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white"
  },
  textInput: {
    fontSize: 40
  }
});
