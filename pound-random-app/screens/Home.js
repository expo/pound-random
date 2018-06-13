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
import Api from "../Api";
import { Feather } from "@expo/vector-icons";

const Separator = () => <View style={{ height: 8 }} />;

export default class Home extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = { posts: [] };

  _fetchPostsAsync = async () => {
    let posts = await Api.callMethodAsync("feed");
    this.setState({ posts });
  };

  componentDidMount() {
    this._fetchPostsAsync();
  }

  _onPress(item) {
    console.log("Item pressed: ", item);
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={{ flex: 1, width: "100%", marginTop: 16 }}
          keyExtractor={x => {
            return x.postId;
          }}
          data={this.state.posts}
          renderItem={({ item }) => <TextPost post={item} />}
          ItemSeparatorComponent={Separator}
        />
        <TouchableOpacity style={styles.currentTagContainer}>
          <Text style={styles.currentTag}>all</Text>
          <Feather name="chevron-up" size={24} color="black" />
        </TouchableOpacity>
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
  },
  currentTagContainer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center"
  },
  currentTag: {
    fontSize: 24
  }
});
