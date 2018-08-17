import React, { Component, PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  Easing,
  Animated,
  Image,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Linking,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import moment from 'moment';
import Api from '../../Api';
import colors from '../../colors';
import idx from 'idx';
import { WebBrowser, Constants } from 'expo';
import { tokenizeContent } from '../../helpers';
import Reply from './Reply';
import CardContainer from './CardContainer';
import InputContainer from './InputContainer';
import Input from './Input';
import ButtonsRow from './ButtonsRow';
import DismissButtonTouchable from './DismissButtonTouchable';
import PostButtonTouchable from './PostButtonTouchable';
import { Feather } from '@expo/vector-icons';
import ButtonLabel from './ButtonLabel';
import Modal from './Modal';
import api from '../../Api';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import MaybeScroll from '../MaybeScroll';
import { client } from '../../App';
import { PostFragment } from '../../fragments';

const NewReply = gql`
  mutation newReply($replyTo: ID, $userId: ID!, $content: Json!, $createdTime: String) {
    createReply(replyTo: $replyTo, userId: $userId, content: $content, createdTime: $createdTime) {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

const RepliesQuery = gql`
  query getReplies($id: ID) {
    replies(to: $id) {
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

class Replies extends PureComponent {
  render() {
    const { replies, refetch, threadView, navigation } = this.props;

    return (
      <CardContainer>
        <View style={{ flex: 1 }}>
          <FlatList
            keyExtractor={(x) => {
              return x.postId;
            }}
            scrollEnabled={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            data={threadView ? replies : replies.slice(0, 2)}
            style={{ paddingHorizontal: 8 }}
            ListHeaderComponent={() => (replies.length ? <View style={{ height: 8 }} /> : null)}
            ListFooterComponent={() => (replies.length ? <View style={{ height: 8 }} /> : null)}
            ItemSeparatorComponent={() => (replies.length ? <View style={{ height: 8 }} /> : null)}
            renderItem={({ item, index }) => {
              return (
                <Reply
                  {...item}
                  myUserId={this.props.userId}
                  key={`${index}`}
                  deletePost={async (o) => {
                    return await client.mutate({
                      mutation: DeletePost,
                      variables: o.variables,
                    });
                  }}
                  refetch={refetch}
                />
              );
            }}
          />
          <InputContainer>
            <ButtonsRow>
              <DismissButtonTouchable
                onPress={() => refetch()}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ButtonLabel>Refresh comments</ButtonLabel>
              </DismissButtonTouchable>
              {this.props.userId && threadView ? (
                <PostButtonTouchable
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={async () => {
                    if (threadView) {
                      this.props.showKeyboardAccessory({
                        replyTo: this.props.thread.postId,
                        userId: this.props.thread.userId,
                        refetch: this.props.refetch,
                      });
                    } else {
                      this.props.navigation.navigate('Thread', { post: this.props.thread });
                    }
                  }}>
                  <ButtonLabel>Reply to this post</ButtonLabel>
                </PostButtonTouchable>
              ) : null}
            </ButtonsRow>
          </InputContainer>
        </View>
      </CardContainer>
    );
  }
}

export default Replies;
