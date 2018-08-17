import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, Dimensions, Alert, View } from 'react-native';
import moment from 'moment';
import colors from '../colors';
import { Feather } from '@expo/vector-icons';
import api from '../Api';
import Likes from './Post/Likes';
import UserState from '../UserState';
import { RectButton } from 'react-native-gesture-handler';

class Metadata extends Component {
  render() {
    const { post, toggleReplies, numReplies, threadView } = this.props;

    return (
      <View style={styles.metaContainer}>
        <TouchableOpacity
          disabled={threadView || post.userId !== this.props.userId}
          style={[
            styles.buttonContainer,
            threadView || post.userId !== this.props.userId ? { opacity: 0 } : null,
          ]}
          onPress={async () => {
            if (post.userId === this.props.userId) {
              Alert.alert(
                'Manage Post',
                'Would you like to delete this post?',
                [
                  { text: 'Cancel', onPress: () => null, style: 'cancel' },
                  {
                    text: 'OK',
                    onPress: async () => {
                      await this.props.deletePost({
                        variables: {
                          postId: post.postId,
                          userId: UserState.state.userId,
                        },
                      });
                    },
                  },
                ],
                { cancelable: false }
              );
            }
          }}>
          <Feather name="trash-2" color="black" size={24} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <Likes userId={this.props.userId} post={post} />
          <TouchableOpacity
            disabled={threadView}
            style={styles.buttonContainer}
            onPress={() => {
              if (!threadView) {
                this.props.navigation.navigate('Thread', { post });
              }
            }}>
            <Feather name="message-square" color="black" size={24} />
            <Text style={styles.meta}>{numReplies ? `  ${numReplies}` : null}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default Metadata;

const styles = StyleSheet.create({
  metaContainer: {
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  meta: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'InterUI Medium',
  },
  buttonContainer: {
    borderRadius: 4,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
});
