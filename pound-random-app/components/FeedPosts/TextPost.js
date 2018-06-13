import React, { Component } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";

const content = {
  body:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It ... ",
  tags: ["design-facts", "big-facts"],
  author: { displayName: "YaBoiBezier" }
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width - 32,
    borderRadius: 12,
    alignSelf: "center",
    backgroundColor: "#C4C4C4"
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
  }
});

export default class TextPost extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.body}>{content.body}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.meta}>#{content.tags[0]}</Text>
          <Text style={styles.meta}>@{content.author.displayName}</Text>
        </View>
      </View>
    );
  }
}
