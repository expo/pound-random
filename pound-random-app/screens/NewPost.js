import React from "react";
import {
  Button,
  Clipboard,
  Image,
  Text,
  TextInput,
  View,
  Dimensions,
  TouchableOpacity
} from "react-native";
import Expo from "expo";
import { Feather } from "@expo/vector-icons";

import Api from "../Api";

export default class NewPost extends React.Component {
  state = {
    text: "",
    linkInfo: null,
    url: null,
    image: null
  };

  componentDidMount() {
    this._setupAsync();
  }

  _setupAsync = async () => {
    console.log("_setupAsync();");
    let clipboardContent = await Clipboard.getString();

    if (
      clipboardContent.startsWith("http://") ||
      clipboardContent.startsWith("https://")
    ) {
      console.log("URL in clipboard:", clipboardContent);
      let url = clipboardContent;
      this.setState({ url });
      let linkInfo = await Api.callMethodAsync("infoForLink", url);
      this.setState({ linkInfo });
    } else {
      this.setState({ linkInfo: null, url: null });
    }
    console.log(this.state);
  };

  _submitAsync = async () => {
    try {
      await Api.callMethodAsync("createPost", {
        content: this.state.text,
        url: null,
        replyTo: null
      });
      this.props.navigation.navigate("Home");
    } catch (e) {
      if (e.type === "CLIENT_ERROR") {
        console.warn("Error: " + e);
        // Where should we go?
        // this.props.navigation.navigate("MiscSettings");
      }
    }
  };

  _pickImage = async () => {
    const { Permissions } = Expo;
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (status !== "granted") {
      alert("Camera Roll permission not granted");
      return;
    }

    let result = await Expo.ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    console.log(result);

    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }
  };

  render() {
    const { image } = this.state;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white"
        }}
      >
        {image && (
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
        )}
        <TextInput
          style={{
            width: Dimensions.get("window").width - 48,
            backgroundColor: "#C4C4C4",
            borderRadius: 12,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 16,
            paddingBottom: 16,
            textAlignVertical: "center",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 18,
            fontWeight: "600"
          }}
          multiline
          underlineColorAndroid="transparent"
          autoFocus
          placeholder="Deep thoughts go here 🧐"
          onChangeText={text => {
            this.setState({ text });
          }}
        />
        <TouchableOpacity
          onPress={() => {
            this._pickImage();
          }}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#828282",
            paddingHorizontal: 32,
            paddingVertical: 8,
            marginVertical: 8,
            borderRadius: 8
          }}
        >
          <Feather name="image" size={16} color="white" />
        </TouchableOpacity>
        {this.state.linkInfo && (
          <View>
            <Text>{this.state.url}</Text>
            <Image
              source={{
                uri: this.state.linkInfo.domain.logo
              }}
              style={{ height: 32, width: 32 }}
            />
            <Text>{this.state.linkInfo.domain.name}</Text>
          </View>
        )}

        <View
          style={{
            position: "absolute",
            bottom: 0,
            paddingVertical: 24,
            flexDirection: "row",
            width: "100%",
            alignItems: "center"
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.goBack();
            }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 24, fontWeight: "600" }}>DISCARD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            onPress={() => {
              this._submitAsync();
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "600" }}>POST</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
