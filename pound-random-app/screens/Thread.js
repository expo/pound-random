import React from "react";
import {
  Button,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  WebView,
  FlatList,
  ImageBackground
} from "react-native";
import { LinearGradient } from "expo";
import TextPost from "../components/FeedPosts/TextPost";
import MediaPost from "../components/FeedPosts/MediaPost";
import LinkPost from "../components/FeedPosts/LinkPost";
import Api from "../Api";
import { Feather } from "@expo/vector-icons";
import { Transition } from "react-navigation-fluid-transitions";
import moment from "moment";

const Separator = () => <View style={{ height: 8 }} />;

export default class Thread extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    posts: [],
    refreshing: false,
    showComments: this.props.navigation.getParam("type", "text") !== "link"
  };

  _fetchPostsAsync = async () => {
    this.setState({ refreshing: true });
    let posts = await Api.callMethodAsync("feed");
    posts = posts.filter(
      p =>
        p.replyTo &&
        p.replyTo === this.props.navigation.getParam("payload", {}).postId
    );
    this.setState({ posts, refreshing: false });
  };

  componentDidMount() {
    this._fetchPostsAsync();
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      payload => {
        console.debug("willFocus", payload);

        this._fetchPostsAsync();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  _onPress(item) {
    console.log("Item pressed: ", item);
  }

  render() {
    const url = this.props.navigation.getParam("payload", {}).url;
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.rootPostContainer,
            this.props.navigation.getParam("type", "text") === "link" &&
            !this.state.showComments
              ? { flex: 1 }
              : {}
          ]}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              style={{ margin: 16 }}
              onPress={() => this.props.navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            {this.props.navigation.getParam("type", "text") === "link" && (
              <TouchableOpacity
                style={{ margin: 16 }}
                onPress={() =>
                  this.setState(state => {
                    return { showComments: !state.showComments };
                  })
                }
              >
                <Feather
                  name={
                    !this.state.showComments ? "message-circle" : "minus-circle"
                  }
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>

          {url &&
            !this.state.showComments && (
              <WebView
                startInLoadingState
                source={{ uri: url }}
                style={{
                  width: "100%",
                  height: Dimensions.get("window").height
                }}
              />
            )}

          <Transition
            shared={`content-${this.props.navigation.getParam("index", 0)}`}
          >
            <Text
              style={[
                styles.body,
                [
                  styles.rootPostContainer,
                  this.props.navigation.getParam("type", "text") === "text"
                    ? { paddingTop: 0 }
                    : {}
                ]
              ]}
            >
              {this.props.navigation.getParam("payload", {}).content}
            </Text>
          </Transition>
          <Transition
            shared={`meta-${this.props.navigation.getParam("index", 0)}`}
          >
            <View style={styles.metaContainer}>
              <Text style={styles.meta}>
                {moment(
                  this.props.navigation.getParam("payload", {}).createdTime
                ).fromNow()}
              </Text>
              {this.props.navigation.getParam("payload", {}).userId && (
                <Text style={styles.meta}>
                  @{
                    this.props.navigation
                      .getParam("payload", {})
                      .userId.split(":")[1]
                  }
                </Text>
              )}
            </View>
          </Transition>
        </View>
        {this.state.showComments && (
          <React.Fragment>
            <FlatList
              style={{ flex: 1, width: "100%", marginTop: 16 }}
              keyExtractor={x => {
                return x.postId;
              }}
              refreshing={this.state.refreshing}
              onRefresh={this._fetchPostsAsync}
              data={this.state.posts}
              renderItem={({ item, index }) => {
                return item.url ? (
                  <LinkPost
                    post={item}
                    index={index}
                    navigation={this.props.navigation}
                  />
                ) : (
                  <TextPost
                    post={item}
                    index={index}
                    navigation={this.props.navigation}
                  />
                );
              }}
              ItemSeparatorComponent={Separator}
            />
            <TouchableOpacity
              style={styles.createNewPostContainer}
              onPress={() =>
                this.props.navigation.navigate("NewPost", {
                  replyTo: this.props.navigation.getParam("payload", {}).postId
                })
              }
            >
              <Text style={styles.createNewPost}>NEW POST</Text>
            </TouchableOpacity>
          </React.Fragment>
        )}
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
  rootPostContainer: {
    width: "100%",
    // justifyContent: "space-between",
    backgroundColor: "#C4C4C4"
  },
  rootPost: {},
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
  },
  body: {
    fontSize: 14,
    padding: 16,
    fontWeight: "600"
  },
  metaContainer: {
    backgroundColor: "rgba(0,0,0,0.6)",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  meta: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white",
    fontWeight: "600"
  }
});
