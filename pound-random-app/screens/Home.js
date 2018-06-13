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

  state = { posts: [], refreshing: false };

  _fetchPostsAsync = async () => {
    this.setState({ refreshing: true });
    let posts = await Api.callMethodAsync("feed");
    this.setState({ posts, refreshing: false });
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
          refreshing={this.state.refreshing}
          onRefresh={this._fetchPostsAsync}
          data={this.state.posts}
          renderItem={({ item }) => <TextPost post={item} />}
          ItemSeparatorComponent={Separator}
        />
        <TouchableOpacity
          style={styles.createNewPostContainer}
          onPress={() => this.props.navigation.navigate("NewPost")}
        >
          <Text style={styles.createNewPost}>NEW POST</Text>
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
  createNewPostContainer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center"
  },
  createNewPost: {
    fontSize: 20,
    fontWeight: "600"
  }
});
