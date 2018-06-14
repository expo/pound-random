import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity
} from "react-native";
import moment from "moment";
import { Transition } from "react-navigation-fluid-transitions";

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
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate("Thread", {
            type: "text",
            payload: this.props.post,
            index: this.props.index
          })
        }
        style={styles.container}
      >
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
