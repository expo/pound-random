import React, { Component, PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  AppState,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
  ImageBackground,
  Clipboard,
  InteractionManager,
  TouchableOpacity,
  FlatList,
  AsyncStorage,
} from 'react-native';
import moment from 'moment';
import Api from '../../Api';
import Metadata from '../Metadata';
import colors from '../../colors';
import idx from 'idx';
import { WebBrowser, Video, LinearGradient } from 'expo';
import _ from 'lodash';
import { Feather } from '@expo/vector-icons';
import Replies from '../Replies';
import Container from './Container';
import Username from './Username';
import TextContent from './TextContent';
import gql from 'graphql-tag';
import Link from './Link';
import Tweet from './Tweet';
import Vid from './Vid';
import { Query, Mutation } from 'react-apollo';
import MaybeScroll from '../MaybeScroll';
import { client } from '../../App';
import api from '../../Api';
import UserState from '../../UserState';
import { PostFragment } from '../../fragments';
import assets from '../../assets';

const RepliesQuery = gql`
  query getReplies($id: ID) {
    replies(to: $id) {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

const RepliesSubscription = gql`
  subscription replyAdded($postId: ID!) {
    replyAdded(postId: $postId) {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

const DeletePost = gql`
  mutation deletePost($postId: ID!, $userId: ID!) {
    deletePost(postId: $postId, userId: $userId) {
      postId
    }
  }
`;

class Post extends PureComponent {
  state = {
    showReplies: false,
    rehydrated: false,
    userId: null,
    replies: [],
    appState: AppState.currentState,
  };

  repliesQuery = client.watchQuery({
    query: RepliesQuery,
    variables: { id: this.props.post.postId },
    fetchPolicy: 'cache-and-network',
  });

  repliesSubscription = client
    .subscribe({ query: RepliesSubscription, variables: { postId: this.props.post.postId } })
    .subscribe(({ data: { replyAdded: reply } }) => {
      this.setState((state) => ({ replies: [...state.replies, reply] }));
    });

  fetchReplies = () => {
    this.repliesQuerySubscription = this.repliesQuery.subscribe(
      ({ loading, data, errors }) => {
        let stateMutations = {};

        if (data) {
          const { replies } = data;
          stateMutations.replies = replies;
          const { userId } = UserState.state;

          this.setState({ userId });
          replies.forEach((r) => {
            if (userId === r.userId && !this.state.rehydrated) {
              this.setState({ showReplies: true });
            } else if (this.props.post.userId === userId && !this.state.rehydrated) {
              this.setState({ showReplies: true });
            }
          });
        }

        this.setState(stateMutations);
      },
      (e) => {
        console.error(e);
      }
    );
  };

  refetch = async () => {
    await this.repliesQuery.refetch();
  };

  componentWillUnmount() {
    if (this.repliesQuerySubscription) this.repliesQuerySubscription.unsubscribe();
    if (this.repliesSubscription) this.repliesSubscription.unsubscribe();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    if (!this.props.inNotificationView) {
      InteractionManager.runAfterInteractions(async () => {
        this.fetchReplies();

        let stateMutations = {};
        const s = await AsyncStorage.getItem(`${this.props.post.postId}.state.showReplies`);
        if (s) {
          stateMutations.showReplies = JSON.parse(s);
          stateMutations.rehydrated = true;
        }

        this.setState(stateMutations);
      });
    }
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.refetch();
    }
    this.setState({ appState: nextAppState });
  };

  componentDidUpdate() {
    if (!this.props.inNotificationView) {
      InteractionManager.runAfterInteractions(async () => {
        await AsyncStorage.setItem(
          `${this.props.post.postId}.state.showReplies`,
          JSON.stringify(this.state.showReplies)
        );
      });
    }
  }

  content = this.props.post.content.filter(
    (o) => !(o.type === 'text' && o.value.trim().length === 0)
  );

  contentView = this.content.map(({ value, type }, i) => {
    let last = i === this.content.length - 1;

    const self = this;

    class Content extends Component {
      render() {
        switch (type) {
          case 'link':
            return <Link key={i} {...value} last={last} />;
          case 'image':
            const maxHeight = Dimensions.get('window').height;
            const maxWidth = Dimensions.get('window').width;

            const ratio = maxWidth / value.width;

            const width = value.width * ratio;
            const height = value.height * ratio;

            return (
              <Image
                key={i}
                fadeDuration={0}
                source={{ uri: value.uri }}
                style={{
                  height,
                  width,
                  alignSelf: 'center',
                }}
                resizeMode="cover"
              />
            );
          case 'video':
            return <Vid uri={value.uri} key={i} />;
          case 'tweet':
            return (
              <Tweet
                content={value}
                key={i}
                navigation={self.props.navigation}
                post={self.props.post}
                threadView={self.props.threadView}
              />
            );
          case 'youtube':
            const r = value.width / value.height;

            const h = Dimensions.get('window').width / r;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                key={i}
                onPress={() => Linking.openURL(value.uri)}>
                <ImageBackground
                  style={{ height: h, width: '100%' }}
                  source={{ uri: value.cover }}
                  resizeMode="cover">
                  <LinearGradient
                    colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.25)', 'transparent', 'transparent']}
                    style={{
                      flex: 1,
                      width: '100%',
                      borderRadius: 12,
                      backgroundColor: colors.black30,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'InterUI Medium',
                        color: 'white',
                        position: 'absolute',
                        left: 16,
                        top: 16,
                        marginRight: 16,
                      }}>
                      {value.title}
                    </Text>
                    <Image
                      source={assets.icons.youtube}
                      style={{ height: 48 }}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            );
          case 'text':
            return <TextContent key={i} content={value} />;
          default:
            return null;
        }
      }
    }

    if (last) {
      return <Content key={i} />;
    } else {
      return (
        <React.Fragment key={i}>
          <Content />
          <View style={{ height: 4 }} />
        </React.Fragment>
      );
    }
  });

  render() {
    return (
      <Container
        elevation={3}
        style={{
          shadowColor: 'black',
          shadowOpacity: 0.15,
          shadowRadius: 2,
          shadowOffset: { height: 0, width: 0 },
          paddingBottom: this.props.inNotificationView ? 8 : 0,
        }}>
        <MaybeScroll>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (!this.props.inNotificationView) {
                  this.props.navigation.navigate('Profile', { userId: this.props.post.userId });
                }
              }}>
              <Username>@{this.props.post.userId.split(':')[1]}</Username>
            </TouchableOpacity>
            <Username>
              {this.props.post.ts === 'Thu Aug 09 2018 22:51:43 GMT-0700 (PDT)' ||
              this.props.post.ts ===
                'Thu Aug 09 2018 22:51:43 GMT+0000 (Coordinated Universal Time)'
                ? moment.utc(this.props.post.createdTime).format('M/D/YYYY, h:mma')
                : moment
                    .utc(new Date(this.props.post.ts))
                    .local()
                    .format('M/D/YYYY, h:mma')}
            </Username>
          </View>
          {this.contentView}
          {!this.props.inNotificationView ? (
            <Metadata
              threadView={this.props.threadView}
              userId={UserState.state.userId}
              post={{ ...this.props.post }}
              navigation={this.props.navigation}
              numReplies={this.state.replies.length}
              toggleReplies={() => {
                this.setState({ showReplies: !this.state.showReplies });
              }}
              deletePost={async (o) => {
                return await client.mutate({
                  mutation: DeletePost,
                  variables: o.variables,
                });
              }}
            />
          ) : null}
        </MaybeScroll>
        {!this.props.inNotificationView ? (
          <Replies
            threadView={this.props.threadView}
            refetch={this.refetch}
            replies={this.state.replies}
            userId={UserState.state.userId}
            navigation={this.props.navigation}
            visible={this.state.showReplies}
            rehydrated={this.state.rehydrated}
            thread={{
              ...this.props.post,
            }}
            showKeyboardAccessory={this.props.showKeyboardAccessory}
          />
        ) : null}
      </Container>
    );
  }
}

export default Post;
