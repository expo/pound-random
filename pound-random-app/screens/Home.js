import React, { Component } from 'react';
import {
  Button,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  AsyncStorage,
  Platform,
  AppState,
  Alert,
  Dimensions,
  FlatList,
  NetInfo,
  InteractionManager,
  Animated,
  Image,
  KeyboardAvoidingView,
  ImageBackground,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { LinearGradient, Constants, Notifications } from 'expo';
import Post from '../shared/Post';
import Api from '../Api';
import { Feather } from '@expo/vector-icons';
import moment from 'moment';
import colors from '../colors';
import KeyboardAccessory from '../shared/KeyboardAccessory';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';
import _ from 'lodash';
import AuthPrompt from '../shared/AuthPrompt';
import AuthForm from '../shared/AuthForm';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { client } from '../App';
import Drawer from '../shared/Drawer';
import Watermark from '../shared/Watermark';
import { registerForPushNotificationsAsync } from '../helpers';
import UserState from '../UserState';
import { Subscribe } from 'unstated';
import api from '../Api';
import assets from '../assets';
import { PostFragment, NotificationFragment } from '../fragments';

const Separator = () => <View style={{ height: 8 }} />;

const SaveToken = gql`
  mutation saveToken($userId: String, $token: String) {
    writePushToken(userId: $userId, token: $token) {
      userId
      token
    }
  }
`;

const FEED_SUBSCRIPTION = gql`
  subscription postCreated {
    postCreated {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

const DELETION_SUBSCRIPTION = gql`
  subscription postDeleted {
    postDeleted {
      postId
    }
  }
`;

const FEED_QUERY = gql`
  query {
    feed {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

class Home extends React.PureComponent {
  static navigationOptions = {
    header: null,
  };

  state = {
    refreshing: false,
    showAuthForm: false,
    loading: true,
    feed: null,
    userId: null,
    showKeyboardAccessory: false,
    userIdFetchAttempted: false,
    replyOptions: null,
    drawerIsOpen: false,
    appState: AppState.currentState,
  };

  drawerRef = React.createRef();
  flatlistRef = React.createRef();

  hideKeyboardAccessory = () => this.setState({ showKeyboardAccessory: false, replyOptions: null });
  showKeyboardAccessory = (o = null) =>
    this.setState({ showKeyboardAccessory: true, replyOptions: o });

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    this.fetchFeed();

    let stateMutations = {};

    const { userId } = UserState.state;

    if (userId) {
      stateMutations.userId = userId;
      stateMutations.userIdFetchAttempted = true;
      if (Constants.isDevice) {
        registerForPushNotificationsAsync(userId, async (o) => {
          return await client.mutate({
            mutation: SaveToken,
            variables: o.variables,
          });
        });
      }
    } else {
      stateMutations.userIdFetchAttempted = true;
    }

    this.setState(stateMutations);
  }

  feedQuery = client.watchQuery({
    query: FEED_QUERY,
    fetchPolicy: 'cache-and-network',
  });

  fetchFeed = () => {
    this.feedQuerySubscription = this.feedQuery.subscribe(
      ({ loading, data, errors }) => {
        if (data) {
          const { feed } = data;
          let stateMutations = {};
          if (!_.isEqual(feed, this.state.feed)) {
            stateMutations.feed = feed;
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

    this.feedSubscription = client.subscribe({ query: FEED_SUBSCRIPTION }).subscribe(({ data }) => {
      if (data) {
        const { postCreated: post } = data;
        this.setState((state) => {
          const newFeed = [post, ...state.feed];

          return {
            feed: newFeed,
          };
        });
      }
    });

    this.deletionSubscription = client
      .subscribe({ query: DELETION_SUBSCRIPTION })
      .subscribe(({ data }) => {
        if (data) {
          const { postDeleted: post } = data;

          this.setState((state) => {
            const newFeed = state.feed.filter((p) => p.postId !== post.postId);

            return {
              feed: newFeed,
            };
          });
        }
      });
  };

  refetch = async () => {
    this.setState({ refreshing: true });
    await this.feedQuery.refetch();
    this.setState({ refreshing: false });
  };

  componentWillUnmount() {
    if (this.feedQuerySubscription) this.feedQuerySubscription.unsubscribe();
    if (this.feedSubscription) this.feedSubscription.unsubscribe();
    if (this.deletionSubscription) this.deletionSubscription.unsubscribe();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.refetch();
    }
    this.setState({ appState: nextAppState });
  };

  renderItem = ({ item, index }) => {
    return (
      <Post
        post={item}
        refetch={this.refetch}
        navigation={this.props.navigation}
        hideKeyboardAccessory={this.hideKeyboardAccessory}
        showKeyboardAccessory={this.showKeyboardAccessory}
      />
    );
  };

  render() {
    return (
      <Subscribe to={[UserState]}>
        {({ state: { userId } }) => (
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={!__DEV__ ? 'padding' : Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Constants.statusBarHeight}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'black',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <NotificationsButton userId={userId} navigation={this.props.navigation} />
              <TouchableOpacity
                onPress={() => {
                  const h = setInterval(() => {
                    if (this.flatlistRef.current && this.state.feed && this.state.feed.length) {
                      this.flatlistRef.current.scrollToIndex({ index: 0, viewOffset: 0 });

                      clearInterval(h);
                    }
                  }, 32);
                }}>
                <Image
                  source={assets.icons.blueWhite}
                  style={{ height: 28, width: 28 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.floatingButton]}
                onPress={() => {
                  const h = setInterval(() => {
                    if (this.drawerRef.current) {
                      if (this.state.drawerIsOpen) {
                        this.drawerRef.current.closeDrawer();
                        this.setState({ drawerIsOpen: false });
                      } else {
                        this.drawerRef.current.openDrawer();
                        this.setState({ drawerIsOpen: true });
                      }
                      clearInterval(h);
                    }
                  }, 32);
                }}>
                <Feather name="menu" color="white" size={24} />
              </TouchableOpacity>
            </View>
            <DrawerLayout
              drawerWidth={256}
              drawerPosition={DrawerLayout.positions.Right}
              drawerType="front"
              ref={this.drawerRef}
              drawerBackgroundColor={colors.appBackground}
              overlayColor="rgba(0,0,0,0.2)"
              renderNavigationView={() => (
                <Drawer
                  opCount={
                    !this.state.loading && this.state.feed
                      ? this.state.feed.filter((p) => p.userId === userId && p.replyTo === null)
                          .length
                      : 0
                  }
                  drawerLayoutRef={this.drawerRef}
                  userId={userId}
                  setState={(state) => this.setState(state)}
                  navigation={this.props.navigation}
                />
              )}>
              <View style={styles.container}>
                <FlatList
                  style={styles.feed}
                  keyExtractor={(x) => {
                    return x.postId;
                  }}
                  scrollsToTop
                  ref={this.flatlistRef}
                  keyboardShouldPersistTaps="always"
                  refreshing={this.state.refreshing}
                  onRefresh={this.refetch}
                  removeClippedSubviews
                  onEndReachedThreshold={0.5}
                  data={!this.state.loading && this.state.feed ? this.state.feed : []}
                  renderItem={this.renderItem}
                  ItemSeparatorComponent={Separator}
                />
                <View style={{ width: '100%' }}>
                  {this.state.userIdFetchAttempted ? (
                    <React.Fragment>
                      {!!userId ? (
                        <PostInput
                          show={this.showKeyboardAccessory}
                          hide={this.hideKeyboardAccessory}
                          isVisible={this.state.showKeyboardAccessory}
                          replyOptions={this.state.replyOptions}
                        />
                      ) : (
                        <AuthPrompt onPress={() => this.setState({ showAuthForm: true })} />
                      )}
                    </React.Fragment>
                  ) : null}
                </View>
              </View>
            </DrawerLayout>

            <AuthForm
              visible={this.state.showAuthForm}
              onRequestClose={async () => {
                let stateMutations = {};

                stateMutations.showAuthForm = false;

                this.setState(stateMutations);
              }}
              navigation={this.props.navigation}
            />
          </KeyboardAvoidingView>
        )}
      </Subscribe>
    );
  }
}

export default Home;

const GET_NOTIFICATIONS = gql`
  query($userId: ID!) {
    notifications(userId: $userId) {
      ...NotificationFragment
    }
  }
  ${NotificationFragment}
`;

export const PostInput = ({ isVisible, show, hide, replyOptions, threadView }) => (
  <React.Fragment>
    {isVisible ? (
      <KeyboardAccessory
        replyOptions={replyOptions}
        onPostSubmission={async () => {
          hide();
          if (replyOptions && replyOptions.refetch) await replyOptions.refetch();
        }}
        hide={hide}
      />
    ) : threadView ? null : (
      <View style={{ width: '100%', backgroundColor: 'black' }}>
        <TouchableOpacity
          onPress={() => show()}
          activeOpacity={0.7}
          style={{
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.2)',
            marginHorizontal: 2,
            marginVertical: 2,
            padding: 8,
          }}>
          <Text
            style={{
              color: 'rgba(255,255,255,1)',
              fontFamily: 'InterUI Medium',
              fontSize: 16,
              marginLeft: 8,
            }}>
            Add a post
          </Text>
        </TouchableOpacity>
      </View>
    )}
  </React.Fragment>
);

class NotificationsButton extends Component {
  render() {
    const { navigation } = this.props;

    return (
      <TouchableOpacity
        style={[styles.floatingButton]}
        onPress={() => {
          if (!this.props.userId) {
            alert('You must be logged in to access your notifications.');
            return;
          }
          navigation.navigate('Notifications', { userId: this.props.userId });
        }}>
        <Feather name="bell" color="white" size={24} />
      </TouchableOpacity>
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
  floatingButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
