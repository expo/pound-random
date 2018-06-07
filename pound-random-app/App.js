import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

let SERVER_ROOT = "http://ec2-34-219-33-58.us-west-2.compute.amazonaws.com:3200";

async function apiCallAsync(method) {
  let url = SERVER_ROOT + "/" + method;
  let response = await fetch(url);
  let result = await response.json();
  return result;
}

async function fakePostsAsync() {
  return await apiCallAsync("fake_posts");
}

class FakePosts extends React.Component {
  state = {
    loaded: false,
    data: null,
  }

  _loadDataAsync = async () => {
    let data = await fakePostsAsync();
    this.setState({ data, loaded: true });
  }

  componentDidMount() {
    this._loadDataAsync();
  }

  render() {
    if (this.state.loaded) {
      return (
        <View style={{
          marginTop: 40,
          flex: 1,
        }}>
          <FlatList data={this.state.data} renderItem={({ item }) => {
            return (
              <View style={{
                borderColor: 'gray',
                borderWidth: 1,
              }}>
                <Text style={{
                  fontWeight: 'bold',
                }}>{item.title}</Text>
                <Text>{item.content}</Text>
              </View>
            )
          }} />
        </View>
      )
    } else {
      return (<Text>Loading Fake Posts...</Text>);
    }
  }
}

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <FakePosts />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
