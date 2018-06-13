import React from 'react';
import { FlatList, Image, Text, TouchableHighlight, View } from 'react-native';
import Expo from 'expo';

import Api from '../Api';

export default class Feed extends React.Component {
  state = {
    posts: [],
  }

  _fetchPostsAsync = async () => {
    let posts = await Api.callMethodAsync("feed");
    this.setState({ posts });
  }

  componentDidMount() {
    this._fetchPostsAsync();
  }

  _onPress(item) {
    console.log("Item pressed: ", item);
  }

  render() {
    return (
      <View style={{ marginTop: 50, width: 500, height: 500,  }}>
        <FlatList
          keyExtractor={(x) => { return x.postId }}
          data={this.state.posts}
          renderItem={({item}) => {
            let post = item;
            console.log(post, post.extra);
            return (
            <View key={post.postId} style={{
              backgroundColor: 'yellow',
              width: 300,
              height: 100,
            }}>
              <TouchableHighlight key={post.postId} onPress={() => this._onPress(post)}>
                <View style={{ backgroundColor: 'gray' }}>
                  <Text>{post.extra.headline}</Text>
                  <Text>{post.userId}</Text>
                </View>
              </TouchableHighlight>
            </View>
          ); }}
        />
      </View>
    );
  }

}
