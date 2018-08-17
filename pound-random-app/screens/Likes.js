import React, { Component, PureComponent } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  AsyncStorage,
  TouchableOpacity,
  FlatList,
  Text,
  Platform,
} from 'react-native';
import gql from 'graphql-tag';
import { client } from '../App';
import { Feather } from '@expo/vector-icons';
import { Constants } from 'expo';
import { RectButton } from 'react-native-gesture-handler';
import _ from 'lodash';
import colors from '../colors';
import Post from '../shared/Post';
import moment from 'moment';
import Reply from '../shared/Replies/Reply';
import UserState from '../UserState';
import Watermark from '../shared/Watermark';
import Header from '../shared/Header';
import { PostFragment, ReactionFragment } from '../fragments';

const Separator = () => <View style={{ height: 8 }} />;

const GET_LIKES = gql`
  query($userId: ID!) {
    likes(userId: $userId) {
      ...ReactionFragment
    }
  }
  ${ReactionFragment}
`;

const GET_POST = gql`
  query($id: ID!) {
    post(id: $id) {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

class LikedPost extends PureComponent {
  state = { post: null };

  async componentDidMount() {
    const { data, errors } = await client.query({
      query: GET_POST,
      variables: { id: this.props.postId },
    });
    const { post } = data;
    if (post) {
      this.setState({ post: post });
    }
  }

  hideKeyboardAccessory = () => null;
  showKeyboardAccessory = () => null;

  render() {
    return this.state.post ? (
      <TouchableOpacity
        onPress={() => {
          let post = this.state.post;

          if (post) this.props.navigation.navigate('Thread', { post });
        }}>
        <Post
          post={this.state.post}
          navigation={this.props.navigation}
          hideKeyboardAccessory={this.hideKeyboardAccessory}
          showKeyboardAccessory={this.showKeyboardAccessory}
        />
      </TouchableOpacity>
    ) : null;
  }
}

class Likes extends Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    loading: true,
    refreshing: false,
    likes: [],
  };

  likesQuery = client.watchQuery({
    query: GET_LIKES,
    fetchPolicy: 'cache-and-network',
    variables: {
      userId: UserState.state.userId,
    },
  });

  async componentDidMount() {
    this.likesQuerySubscription = this.likesQuery.subscribe(
      ({ loading, data, errors }) => {
        let stateMutations = {};
        if (data) {
          const { likes } = data;
          if (!_.isEqual(likes, this.state.likes)) {
            stateMutations.likes = likes;
          }
          if (loading === false) {
            stateMutations.loading = loading;
          }
        }
        this.setState(stateMutations);
      },
      (e) => {
        console.error(e);
      }
    );
  }

  refetch = async () => {
    this.setState({ refreshing: true });
    await this.likesQuery.refetch();
    this.setState({ refreshing: false });
  };

  componentWillUnmount() {
    if (this.likesQuerySubscription) this.likesQuerySubscription.unsubscribe();
  }

  render() {
    const { userId } = UserState.state;
    return (
      <KeyboardAvoidingView
        behavior={!__DEV__ ? 'padding' : Platform.OS === 'ios' ? 'padding' : null}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Constants.statusBarHeight}>
        <View style={styles.container}>
          <Header label="Likes" navigation={this.props.navigation} />

          <FlatList
            style={styles.feed}
            keyExtractor={(x) => {
              return x.postId;
            }}
            keyboardShouldPersistTaps="always"
            refreshing={this.state.refreshing}
            onRefresh={this.refetch}
            windowSize={3}
            removeClippedSubviews
            ListHeaderComponent={() =>
              this.state.likes.length ? <View style={{ height: 8 }} /> : null
            }
            ListFooterComponent={() =>
              this.state.likes.length ? <View style={{ height: 8 }} /> : null
            }
            ItemSeparatorComponent={() =>
              this.state.likes.length ? <View style={{ height: 8 }} /> : null
            }
            data={!this.state.loading && this.state.likes ? this.state.likes : []}
            renderItem={({ item, index }) => {
              return <LikedPost {...item} navigation={this.props.navigation} />;
            }}
            ItemSeparatorComponent={Separator}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

export default Likes;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.appBackground,
  },
  feed: { flex: 1, width: '100%' },
});
