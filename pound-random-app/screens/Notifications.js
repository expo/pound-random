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
import { NotificationFragment, PostFragment } from '../fragments';

const Separator = () => <View style={{ height: 8 }} />;

const GET_NOTIFICATIONS = gql`
  query($userId: ID!) {
    notifications(userId: $userId) {
      ...NotificationFragment
    }
  }
  ${NotificationFragment}
`;

const GET_POST = gql`
  query($id: ID!) {
    post(id: $id) {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

const CLEAR_NOTIFICATIONS = gql`
  mutation clearNotifications($userId: ID!) {
    clearNotifications(userId: $userId)
  }
`;

class Notification extends PureComponent {
  state = { post: null, parentPost: null };

  async componentDidMount() {
    const { data, errors } = await client.query({
      query: GET_POST,
      variables: { id: this.props.postId },
    });
    const { post } = data;
    if (post) {
      this.setState({ post: post });
    }

    if (post.replyTo) {
      const { data, errors } = await client.query({
        query: GET_POST,
        variables: { id: post.replyTo },
      });

      if (data.post) {
        this.setState({ parentPost: data.post });
      }
    }
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          let post;
          if (this.state.parentPost) {
            post = this.state.parentPost;
          } else {
            post = this.state.post;
          }
          if (post) this.props.navigation.navigate('Thread', { post });
        }}
        style={{
          backgroundColor: 'white',
          paddingVertical: 8,
          borderRadius: 12,
        }}>
        <Text
          style={{
            fontFamily: 'InterUI Medium',
            marginBottom: 8,
            marginHorizontal: 8,
            textAlign: 'center',
            color: 'rgba(0,0,0,0.8)',
            alignSelf: 'center',
            flexWrap: 'wrap',
          }}>
          {this.props.body}
        </Text>
        {this.state.parentPost ? (
          <React.Fragment>
            {this.state.parentPost.replyTo ? (
              <Reply {...this.state.parentPost} />
            ) : (
              <Post inNotificationView post={this.state.parentPost} />
            )}
            <Feather
              name="chevron-down"
              style={{ alignSelf: 'center', marginVertical: 4 }}
              color="black"
              size={24}
            />
          </React.Fragment>
        ) : null}
        {this.state.post ? (
          <React.Fragment>
            {this.state.post.replyTo ? (
              <View style={{ marginHorizontal: 8 }}>
                <Reply {...this.state.post} />
              </View>
            ) : (
              <Post inNotificationView post={this.state.post} />
            )}
          </React.Fragment>
        ) : (
          <Text
            style={{
              fontFamily: 'InterUI Medium',
              marginBottom: 8,
              marginHorizontal: 8,
              textAlign: 'center',
              fontSize: 16,
              alignSelf: 'center',
              flexWrap: 'wrap',
            }}>
            Post not found
          </Text>
        )}
      </TouchableOpacity>
    );
  }
}

class Notifications extends Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    loading: true,
    refreshing: false,
    notifications: [],
  };

  notificationQuery = client.watchQuery({
    query: GET_NOTIFICATIONS,
    fetchPolicy: 'cache-and-network',
    variables: {
      userId: UserState.state.userId,
    },
  });

  async componentDidMount() {
    this.notificationQuerySubscription = this.notificationQuery.subscribe(
      ({ loading, data, errors }) => {
        let stateMutations = {};
        if (data) {
          const { notifications } = data;
          if (!_.isEqual(notifications, this.state.notifications)) {
            stateMutations.notifications = notifications;
          }
          if (loading === false) {
            stateMutations.loading = loading;
          }
          AsyncStorage.setItem(
            '@blue/notifications/notifications_displayed',
            JSON.stringify(notifications.length)
          );
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
    await this.notificationQuery.refetch();
    this.setState({ refreshing: false });
  };

  componentWillUnmount() {
    if (this.notificationQuerySubscription) this.notificationQuerySubscription.unsubscribe();
  }

  hideKeyboardAccessory = () => null;
  showKeyboardAccessory = () => null;

  render() {
    const { userId } = UserState.state;
    return (
      <KeyboardAvoidingView
        behavior={!__DEV__ ? 'padding' : Platform.OS === 'ios' ? 'padding' : null}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Constants.statusBarHeight}>
        <View style={styles.container}>
          <Header label="Notifications" navigation={this.props.navigation} />

          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={async () => {
              await client.mutate({
                mutation: CLEAR_NOTIFICATIONS,
                variables: {
                  userId: UserState.state.userId,
                },
              });
              await this.notificationQuery.refetch();
            }}>
            <Text style={{ fontFamily: 'InterUI Medium', fontSize: 16, color: colors.red }}>
              Clear Notifications
            </Text>
          </TouchableOpacity>

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
              this.state.notifications.length ? <View style={{ height: 8 }} /> : null
            }
            ListFooterComponent={() =>
              this.state.notifications.length ? <View style={{ height: 8 }} /> : null
            }
            ItemSeparatorComponent={() =>
              this.state.notifications.length ? <View style={{ height: 8 }} /> : null
            }
            data={!this.state.loading && this.state.notifications ? this.state.notifications : []}
            renderItem={({ item, index }) => {
              return <Notification {...item} navigation={this.props.navigation} />;
            }}
            ItemSeparatorComponent={Separator}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

export default Notifications;

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
