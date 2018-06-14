import React from "react";
import {
  Button,
  Clipboard,
  Image,
  Text,
  TextInput,
  View,
  Dimensions,
  Switch,
  KeyboardAvoidingView,
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
    image: null,
    willAttachUrl: false
  };

  componentDidMount() {
    this.clipboardScanHandle = setInterval(this._setupAsync, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.clipboardScanHandle);
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
  };

  _submitAsync = async () => {
    try {
      await Api.callMethodAsync("createPost", {
        content: this.state.text,
        url: this.state.willAttachUrl ? this.state.url : null,
        replyTo: this.props.navigation.getParam("replyTo", null)
      });
      this.props.navigation.goBack();
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

    if (!result.cancelled) {
      Image.getSize(
        result.uri,
        (srcWidth, srcHeight) => {
          const maxHeight = Dimensions.get("window").height; // or something else
          const maxWidth = Dimensions.get("window").width - 80;

          const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

          this.setState({
            image: {
              width: srcWidth * ratio,
              height: srcHeight * ratio,
              uri: result.uri
            }
          });
        },
        error => {
          console.log("error:", error);
        }
      );
    }
  };

  render() {
    const { image } = this.state;

    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          flex: 1,
          backgroundColor: "transparent"
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "white",
            alignItems: "center"
          }}
        >
          <View />
          <View>
            <View
              style={{
                width: Dimensions.get("window").width - 48,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                backgroundColor: "#C4C4C4"
              }}
            >
              {image && (
                <Image
                  source={{ uri: image.uri }}
                  style={{
                    height: image.height,
                    width: image.width,
                    borderRadius: 16
                  }}
                  resizeMode="contain"
                />
              )}
              <TextInput
                style={{
                  textAlign: "center",
                  textAlignVertical: "center",
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
            </View>
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
                alignSelf: "center",
                borderRadius: 8
              }}
            >
              <Feather name="image" size={16} color="white" />
            </TouchableOpacity>
          </View>
          {this.state.willAttachUrl ? (
            this.state.linkInfo ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 16
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {this.state.linkInfo.domain.logo && (
                    <Image
                      source={{
                        uri: this.state.linkInfo.domain.logo
                      }}
                      style={{
                        height: 32,
                        width: 32,
                        borderRadius: 4,
                        marginRight: 8
                      }}
                    />
                  )}
                  <Text>{this.state.url}</Text>
                </View>
                <Text>{this.state.linkInfo.domain.name}</Text>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16
                }}
              >
                <Text>Copy a link into your Clipboard to attach a link</Text>
              </View>
            )
          ) : null}
          <View
            style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
          >
            <Switch
              value={this.state.willAttachUrl}
              onValueChange={v => this.setState({ willAttachUrl: v })}
            />
            <Text style={{ fontSize: 14, paddingLeft: 8 }}>
              Attach a link this post
            </Text>
          </View>
          <View
            style={{
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
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "600" }}>DISCARD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
              onPress={() => {
                this._submitAsync();
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "600" }}>POST</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}
