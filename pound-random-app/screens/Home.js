<<<<<<< HEAD
import { Button, FlatList, Text, TextInput, View, StyleSheet } from "react-native";
||||||| merged common ancestors
import { Button, Text, TextInput, View, StyleSheet } from "react-native";
=======
import {
  Button,
  Text,
  TextInput,
  View,
  StyleSheet,
  FlatList
} from "react-native";
>>>>>>> [login] create a nearly static login screen
import React from "react";

import Api from "../Api";
import Signup from "../Signup";

export default class Home extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    username: "",
    mobileNumber: ""
  };

  _sortOfSignupAsync = async () => {
    try {
      let result = await Api.callMethodAsync("sortOfSignup", {
        username: this.state.username,
        mobileNumber: this.state.mobileNumber
      });
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    let s = {
      fontSize: 40
    };

    return (
      <View style={styles.container}>
        <Text>i'm home</Text>

        {/* <Adder />
        <ErrorButton />
        <FakePosts /> */}
      </View>
    );
  }
}

class FakePosts extends React.Component {
  state = {
    loaded: false,
    data: null
  };

  _loadDataAsync = async () => {
    let data = await Api.callMethodAsync("fakePosts");
    this.setState({ data, loaded: true });
  };

  componentDidMount() {
    this._loadDataAsync();
  }

  render() {
    if (this.state.loaded) {
      return (
        <View
          style={{
            marginTop: 40,
            flex: 1
          }}
        >
          <FlatList
            data={this.state.data}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    borderColor: "gray",
                    borderWidth: 1
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold"
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text>{item.content}</Text>
                </View>
              );
            }}
          />
        </View>
      );
    } else {
      return <Text>Loading Fake Posts...</Text>;
    }
  }
}

class Adder extends React.Component {
  state = {
    a: "0",
    b: "0",
    result: null,
    loading: false
  };

  _updateAsync = async () => {
    this.setState({ loading: true });

    let a = parseInt(this.state.a);
    let b = parseInt(this.state.b);
    console.log("Remotely adding ", a, b);
    let result = await Api.callMethodAsync(
      "subtract",
      parseInt(this.state.a),
      parseInt(this.state.b)
    );
    this.setState({ result, loading: false });
  };

  render() {
    let s = {
      fontSize: 60
    };
    return (
      <View>
        <TextInput
          keyboardType="numeric"
          style={s}
          value={this.state.a}
          onChangeText={text => {
            this.setState({ a: text });
          }}
          onSubmitEditing={() => {
            this._updateAsync();
          }}
        />
        <TextInput
          keyboardType="numeric"
          style={s}
          value={this.state.b}
          onChangeText={text => {
            this.setState({ b: text });
          }}
          onSubmitEditing={() => {
            this._updateAsync();
          }}
        />
        {(this.state.loading && <Text>Loading...</Text>) || (
          <Text>{this.state.result}</Text>
        )}
      </View>
    );
  }
}

class SimpleAdd extends React.Component {
  state = {
    loading: false,
    result: null
  };

  _addAsync = async () => {
    let result = await Api.callMethodAsync("add", 42, 5);
    this.setState({ result, loading: false });
  };

  componentDidMount() {
    this._addAsync();
  }

  render() {
    return (
      <View>
        <Text>Simple Adder</Text>
        {(this.state.loading && <Text>Loading...</Text>) || (
          <Text>{"result=" + this.state.result}</Text>
        )}
      </View>
    );
  }
}

class SortOfLogin extends React.Component {
  state = {
    username: null
  };

  _submitAsync = async () => {
    let result = await Api.callMethodAsync("sortOfLogin", this.state.username);
    await api.storeSessionAsync(result.token);
    console.log(result);
  };

  render() {
    return (
      <View
        style={{
          marginBottom: 50
        }}
      >
        <Text>Username:</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={this.state.username}
          onChangeText={text => {
            this.setState({ username: text });
          }}
          onSubmitEditing={() => {
            this._submitAsync();
          }}
        />
        <Button
          title="Login"
          onPress={() => {
            this._submitAsync();
          }}
        />
      </View>
    );
  }
}

class ErrorButton extends React.Component {
  _callErrorApiAsync = async () => {
    try {
      let _x = await Api.callMethodAsync("error");
      console.log("Woah, didn't get an error");
    } catch (err) {
      if (err && err.type === "CLIENT_ERROR") {
        console.log("ClientError:", err, err.code, err.props);
      }
    }
  };

  render() {
    return (
      <Button
        title="Error"
        onPress={() => {
          this._callErrorApiAsync();
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white"
  },
  textInput: {
    fontSize: 40
  }
});
