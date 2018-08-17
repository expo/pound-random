import React, { Component } from 'react';
import { StyleSheet, KeyboardAvoidingView, View, Text, Platform, ScrollView } from 'react-native';
import Post from '../shared/Post';
import { Constants } from 'expo';
import { PostInput } from './Home';
import colors from '../colors';
import MaybeScroll from '../shared/MaybeScroll';
import { RectButton } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import Header from '../shared/Header';

export default class Thread extends React.PureComponent {
  static navigationOptions = {
    header: null,
  };

  post = this.props.navigation.getParam('post', null);

  state = {
    showKeyboardAccessory: false,
    replyOptions: { replyTo: this.post.postId, userId: this.post.userId },
  };

  scrollViewRef = React.createRef();

  componentDidUpdate() {
    if (this.state.showKeyboardAccessory) {
      setTimeout(this.exposeControls, 250);
    }
  }

  exposeControls = () => {
    const h = setInterval(() => {
      if (this.scrollViewRef.current) {
        this.scrollViewRef.current.scrollToEnd();

        clearInterval(h);
      }
    }, 32);
  };

  hideKeyboardAccessory = () => this.setState({ showKeyboardAccessory: false });
  showKeyboardAccessory = (o = null) =>
    this.setState({ showKeyboardAccessory: true, replyOptions: o });

  render() {
    const { post } = this;
    return (
      <KeyboardAvoidingView
        behavior={!__DEV__ ? 'padding' : Platform.OS === 'ios' ? 'padding' : null}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Constants.statusBarHeight}>
        <Header label="Comments" navigation={this.props.navigation} />
        <View style={{ flex: 1 }}>
          <MaybeScroll>
            <Post
              threadView
              post={post}
              navigation={this.props.navigation}
              refetch={async () => null}
              hideKeyboardAccessory={this.hideKeyboardAccessory}
              showKeyboardAccessory={this.showKeyboardAccessory}
            />
          </MaybeScroll>
          <PostInput
            show={this.showKeyboardAccessory}
            hide={this.hideKeyboardAccessory}
            threadView
            isVisible={this.state.showKeyboardAccessory}
            replyOptions={this.state.replyOptions}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  feed: { flex: 1, width: '100%' },
});
