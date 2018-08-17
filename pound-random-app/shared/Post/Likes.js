import React, { Component } from 'react';
import { View, TouchableOpacity, Text, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { client } from '../../App';
import gql from 'graphql-tag';
import _ from 'lodash';
import colors from '../../colors';
import { RectButton } from 'react-native-gesture-handler';
import api from '../../Api';
import assets from '../../assets';
import { ReactionFragment } from '../../fragments';

const GET_LIKES = gql`
  query getLikes($postId: ID!) {
    reactions(postId: $postId) {
      ...ReactionFragment
    }
  }
  ${ReactionFragment}
`;

const LIKES_SUBSCRIPTION = gql`
  subscription reactedTo($postId: ID!) {
    reactedTo(postId: $postId) {
      ...ReactionFragment
    }
  }
  ${ReactionFragment}
`;

const LIKE_POST = gql`
  mutation likePost($postId: ID!, $userId: ID!) {
    likePost(postId: $postId, userId: $userId) {
      ...ReactionFragment
    }
  }
  ${ReactionFragment}
`;

const UNLIKE_POST = gql`
  mutation unLikePost($reactionId: ID!, $userId: ID!) {
    unLikePost(reactionId: $reactionId, userId: $userId) {
      ...ReactionFragment
    }
  }
  ${ReactionFragment}
`;

export default class Likes extends Component {
  state = {
    reactions: {},
    userId: null,
    mutationInProgress: false,
  };

  likesObservableQuery = client.watchQuery({
    query: GET_LIKES,
    variables: { postId: this.props.post.postId },
    fetchPolicy: 'cache-and-network',
  });

  likesSubscription = null;

  componentDidMount() {
    this.likesSubscription = this.likesObservableQuery.subscribe(
      async ({ loading, data, errors }) => {
        if (data) {
          const { reactions } = data;

          let stateMutations = { ...this.state };
          stateMutations.userId = await api.getUserIdAsync();

          if (reactions) {
            for (const r of reactions) {
              stateMutations.reactions[r.userId] = r;
            }
          }

          this.setState(stateMutations);
        }
      },
      (e) => {
        console.error(e);
      }
    );

    client
      .subscribe({ query: LIKES_SUBSCRIPTION, variables: { postId: this.props.post.postId } })
      .subscribe(async ({ data: { reactedTo: reaction } }) => {
        const userId = await api.getUserIdAsync();
        this.setState((state) => {
          let reactions = { ...state.reactions };

          reactions[reaction.userId] = reaction;

          return {
            reactions,
          };
        });
      });
  }

  componentWillUnmount() {
    if (this.likesSubscription) this.likesSubscription.unsubscribe();
  }

  render() {
    let userHasLiked = false;

    if (this.state.userId && this.state.reactions[this.state.userId]) {
      userHasLiked = this.state.reactions[this.state.userId].vote === 1 ? true : false;
    }

    const likes = Object.values(this.state.reactions).filter((r) => r.vote === 1).length;

    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: `rgba(255,255,255,0.3)`,
          borderRadius: 4,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 4,
          paddingHorizontal: 12,
        }}
        onPress={async () => {
          if (!this.state.mutationInProgress && this.state.userId) {
            this.setState({ mutationInProgress: true });
            if (userHasLiked) {
              await client.mutate({
                mutation: UNLIKE_POST,
                variables: {
                  userId: this.state.userId,
                  reactionId: this.state.reactions[this.state.userId].reactionId,
                },
              });
            } else {
              await client.mutate({
                mutation: LIKE_POST,
                variables: { userId: this.state.userId, postId: this.props.post.postId },
              });
            }
            this.setState({ mutationInProgress: false });
          }
        }}
        disabled={!this.state.userId || this.state.mutationInProgress}>
        {this.state.mutationInProgress ? (
          <ActivityIndicator color={colors.expo} />
        ) : (
          <React.Fragment>
            <Image
              style={{ width: 24 }}
              resizeMode="contain"
              fadeDuration={0}
              source={userHasLiked ? assets.icons.heartClosed : assets.icons.heartOpen}
            />

            {likes ? (
              <Text
                style={{
                  fontSize: 20,
                  color: 'black',
                  fontFamily: 'InterUI Medium',
                }}>
                {' '}
                {likes}
              </Text>
            ) : null}
          </React.Fragment>
        )}
      </TouchableOpacity>
    );
  }
}
