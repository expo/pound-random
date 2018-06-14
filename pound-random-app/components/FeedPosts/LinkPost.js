import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  Linking,
  TouchableOpacity
} from "react-native";
import moment from "moment";
import Api from "../../Api";
import { Transition } from "react-navigation-fluid-transitions";

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width - 32,
    borderRadius: 12,
    alignSelf: "center",
    backgroundColor: "#C4C4C4"
  },
  placeHolderFavicon: {
    height: 24,
    width: 24,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginRight: 8
  },
  favicon: {
    height: 24,
    width: 24,
    borderRadius: 4,
    marginRight: 8
  },
  linkTitleRow: {
    flexDirection: "row",
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8
  },
  domain: {
    fontWeight: "bold",
    fontStyle: "italic",
    alignSelf: "center"
  },
  description: {
    marginHorizontal: 16,
    fontSize: 12
  },
  body: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontWeight: "600"
  },
  metaContainer: {
    backgroundColor: "rgba(0,0,0,0.6)",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  meta: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white",
    fontWeight: "600"
  },
  separator: {
    width: Dimensions.get("window").width - 96,
    height: 1,
    marginVertical: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignSelf: "center"
  }
});

export default class LinkPost extends Component {
  state = { linkInfo: {} };
  async componentDidMount() {
    let linkInfo = await Api.callMethodAsync(
      "infoForLink",
      this.props.post.url
    );
    this.setState({ linkInfo });
  }
  render() {
    console.log(this.props.post);
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          // Linking.openURL(this.props.post.url).catch(err =>
          //   console.error("An error occurred", err)
          // )
          this.props.navigation.navigate("Thread", {
            type: "link",
            payload: this.props.post,
            index: this.props.index
          });
        }}
      >
        <View style={styles.linkTitleRow}>
          {this.state.linkInfo.domain && this.state.linkInfo.domain.logo ? (
            <Image
              style={styles.favicon}
              source={{ uri: this.state.linkInfo.domain.logo }}
            />
          ) : (
            <View style={styles.placeHolderFavicon} />
          )}
          <Text style={styles.domain}>{this.props.post.url}</Text>
        </View>
        <Text style={styles.description}>
          {this.state.linkInfo.domain && this.state.linkInfo.domain.name}
        </Text>
        <View style={styles.separator} />
        <Transition shared={`content-${this.props.index}`}>
          <Text style={styles.body}>{this.props.post.content}</Text>
        </Transition>
        <View style={styles.metaContainer}>
          <Text style={styles.meta}>
            {moment(this.props.post.createdTime).fromNow()}
          </Text>
          {this.props.post.userId && (
            <Text style={styles.meta}>
              @{this.props.post.userId.split(":")[1]}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}
