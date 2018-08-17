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
import { createBottomTabNavigator } from 'react-navigation';

import Header from '../shared/Header';
import { handleFromUserId } from '../helpers';
import { PostFragment, ReactionFragment } from '../fragments';

const Separator = () => <View style={{ height: 8 }} />;

const GET_POSTS = gql`
  query($userId: ID!) {
    postsFrom(userId: $userId) {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

export default class Profile extends Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    loading: true,
    refreshing: false,
    posts: [],
  };

  user = this.props.navigation.getParam('userId', 'user:fiberjw');

  postsQuery = client.watchQuery({
    query: GET_POSTS,
    fetchPolicy: 'cache-and-network',
    variables: { userId: this.user },
  });

  refetch = async () => {
    this.setState({ refreshing: true });
    await this.postsQuery.refetch();
    this.setState({ refreshing: false });
  };

  renderItem = ({ item, index }) => {
    return (
      <Post
        post={item}
        refetch={this.refetch}
        navigation={this.props.navigation}
        hideKeyboardAccessory={() => null}
        showKeyboardAccessory={() => null}
      />
    );
  };

  componentDidMount() {
    this.postsQuerySubscription = this.postsQuery.subscribe(
      ({ loading, data, errors }) => {
        if (data) {
          const { postsFrom } = data;
          let stateMutations = {};
          if (!_.isEqual(postsFrom, this.state.posts)) {
            stateMutations.posts = postsFrom;
          }
          if (loading === false) {
            stateMutations.loading = loading;
          }
          this.setState(stateMutations);
        }
        if (errors) {
          this.setState({ loading: false, refreshing: false });
        }
      },
      (e) => {
        console.error(e);
        this.setState({ loading: false, refreshing: false });
      }
    );
  }

  componentWillUnmount() {
    if (this.postsQuerySubscription) this.postsQuerySubscription.unsubscribe();
  }

  render() {
    const { userId } = UserState.state;

    console.log(this.state.posts);

    return (
      <KeyboardAvoidingView
        behavior={!__DEV__ ? 'padding' : Platform.OS === 'ios' ? 'padding' : null}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Constants.statusBarHeight}>
        <View style={styles.container}>
          <Header label={handleFromUserId(this.user)} navigation={this.props.navigation} />
          {this.state.posts.length ? (
            <FlatList
              style={styles.feed}
              keyExtractor={(x) => {
                return x.postId;
              }}
              scrollsToTop
              keyboardShouldPersistTaps="always"
              refreshing={this.state.refreshing}
              onRefresh={this.refetch}
              windowSize={7}
              initialNumToRender={8}
              maxToRenderPerBatch={2}
              onEndReachedThreshold={0.5}
              data={!this.state.loading && this.state.posts ? this.state.posts : []}
              renderItem={this.renderItem}
              ItemSeparatorComponent={Separator}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: 'InterUI Medium',
                  color: 'black',
                  fontSize: 20,
                  marginHorizontal: 24,
                  textAlign: 'center',
                }}>
                This user either doesn't exist or hasn't posted to Blue yet.
              </Text>
            </View>
          )}
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
    alignItems: 'center',
    backgroundColor: colors.appBackground,
  },
  feed: { flex: 1, width: '100%' },
});
