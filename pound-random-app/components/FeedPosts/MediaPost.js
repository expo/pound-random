import React, { Component } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import moment from "moment";

const content = {
  image: null,
  body: "What art thou?",
  tags: ["olden-memes"],
  author: { displayName: "Pepe" }
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width - 32,
    borderRadius: 12,
    alignSelf: "center",
    backgroundColor: "#C4C4C4"
  },
  placeHolderImage: {
    marginTop: 16,
    marginHorizontal: 16,
    width: Dimensions.get("window").width - 64,
    height: 256,
    borderRadius: 4,
    alignSelf: "center",
    backgroundColor: "#E0E0E0"
  },
  body: {
    fontSize: 14,

    fontWeight: "600",
    padding: 16
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
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white"
  }
});

export default class MediaPost extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.placeHolderImage} />
        <Text style={styles.body}>{content.body}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.meta}>
            {moment(this.props.post.createdTime).fromNow()}
          </Text>
          <Text style={styles.meta}>@{content.author.displayName}</Text>
        </View>
      </View>
    );
  }
}
