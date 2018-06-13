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
import TextPost from "../components/FeedPosts/TextPost";
import MediaPost from "../components/FeedPosts/MediaPost";
import LinkPost from "../components/FeedPosts/LinkPost";

const Separator = () => <View style={{ height: 8 }} />;

export default class Home extends React.Component {
  static navigationOptions = {
    header: null
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={{ flex: 1, width: "100%", marginTop: 16 }}
          data={[{ key: "a" }, { key: "b" }, { key: "c" }]}
          renderItem={({ item }) => {
            switch (item.key) {
              case "a":
                return <TextPost />;
              case "b":
                return <MediaPost />;
              case "c":
                return <LinkPost />;
              default:
                return <TextPost />;
            }
          }}
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
