import React, { Component } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";

const content = {
  link: "https://this.is.awebsite.co/...",
  description:
    "Wizard News - Voldemort has eliminated 2/3 Potters, leaving ...",
  body: "Oh shoot! This is about to be the greatest 1v1 of the century 👀",
  tags: ["harry-pot"],
  author: { displayName: "Gilderoy" }
};

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
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.linkTitleRow}>
          <View style={styles.placeHolderFavicon} />
          <Text style={styles.domain}>{content.link}</Text>
        </View>
        <Text style={styles.description}>{content.description}</Text>
        <View style={styles.separator} />
        <Text style={styles.body}>{content.body}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.meta}>#{content.tags[0]}</Text>
          <Text style={styles.meta}>@{content.author.displayName}</Text>
        </View>
      </View>
    );
  }
}
