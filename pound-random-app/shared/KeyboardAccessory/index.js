import React, { Component } from 'react';
import {
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Clipboard,
  StyleSheet,
  Dimensions,
  ImageStore,
  FlatList,
  ScrollView,
  Alert,
  Platform,
  Animated,
  ActivityIndicator,
  Easing,
  Keyboard,
  ImageBackground,
} from 'react-native';
import { LinearGradient, Permissions, ImagePicker, Notifications, Constants } from 'expo';
import Api from '../../Api';
import colors from '../../colors';
import {
  tokenizeContent,
  getSize,
  formDataForBase64,
  postFormDataToImgur,
  handleFromUserId,
} from '../../helpers';
import Container from './Container';
import MaybeScroll from '../MaybeScroll';
import RemoveImageTouchable from './RemoveImageTouchable';
import Input from './Input';
import _ from 'lodash';
import Toolbar from './Toolbar';
import Button from './Button';
import { Feather } from '@expo/vector-icons';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import moment from 'moment';
import api from '../../Api';
import isUrl from 'is-url';
import { registerForPushNotificationsAsync } from '../../helpers';
import { client } from '../../App';
import UserState from '../../UserState';
import { GiphyModal } from '../GiphyModal';
import { PostFragment, EmoteFragment } from '../../fragments';

const NewPost = gql`
  mutation newPost($replyTo: ID, $userId: ID!, $content: Json!, $createdTime: String) {
    createPost(replyTo: $replyTo, userId: $userId, content: $content, createdTime: $createdTime) {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

const NewReply = gql`
  mutation newReply($replyTo: ID, $userId: ID!, $content: Json!, $createdTime: String) {
    createReply(replyTo: $replyTo, userId: $userId, content: $content, createdTime: $createdTime) {
      ...PostFragment
    }
  }
  ${PostFragment}
`;

const SaveToken = gql`
  mutation saveToken($userId: String, $token: String) {
    writePushToken(userId: $userId, token: $token) {
      userId
      token
    }
  }
`;

const GET_USERS = gql`
  query {
    users
  }
`;

class KeyboardAccessory extends Component {
  state = {
    text: '',
    image: null,
    images: [],
    isPosting: false,
    users: [],
    postButtonOpacity: 0.1,
    linkSuggestion: null,
    showEmotePicker: false,
    showGifPicker: false,
    showMentionsAutocomplete: false,
  };

  scrollViewRef = React.createRef();

  permissionGuard = async () => {
    const { status: cStatus } = await Permissions.askAsync(Permissions.CAMERA);
    const { status: crStatus } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (cStatus !== 'granted' || crStatus !== 'granted') {
      Alert.alert(
        'Camera[Roll] permission not granted',
        `To re-enable permissions on iOS:
   - close this app
   - navigate to Settings.app
   - tap Privacy
   - tap Photos
   - find [Expo] Blue and toggle it on
   - repeat the same process for the Camera privacy option
   
   Thanks! 🙌`
      );
      return false;
    }
    return true;
  };

  _pickImage = async () => {
    if (!(await this.permissionGuard())) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.25,
    });

    if (!result.cancelled) {
      this._setImage(result);
    }
  };

  _takePicture = async () => {
    if (!(await this.permissionGuard())) return;

    let result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.25,
    });

    if (!result.cancelled) {
      this._setImage(result);
    }
  };

  _setImage = ({ uri, base64 }) => {
    Image.getSize(
      uri,
      (srcWidth, srcHeight) => {
        const maxHeight = Dimensions.get('window').height;
        const maxWidth = Dimensions.get('window').width - 64;

        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

        this.setState((state) => ({
          images: [
            ...state.images,
            {
              width: srcWidth * ratio,
              height: srcHeight * ratio,
              uri: uri,
              base64: base64,
            },
          ],
        }));

        setTimeout(this.exposeControls, 150);
      },
      (error) => {
        console.log('error:', error);
      }
    );
  };

  exposeControls = () => {
    const h = setInterval(() => {
      if (this.scrollViewRef.current) {
        this.scrollViewRef.current.scrollToEnd();

        clearInterval(h);
      }
    }, 32);
  };

  _submitAsync = (newPostMutation, savePushTokenMutation, newReplyMutation) => async () => {
    this.setState({ isPosting: true });
    Keyboard.dismiss();
    const imageTokens = [];
    const otherTokens = await tokenizeContent(this.state.text);

    try {
      for (const image of this.state.images) {
        const formData = formDataForBase64(image.base64);

        let response = await postFormDataToImgur(formData);

        const rJson = await response.json();

        if (rJson.success) {
          const dimensions = await getSize(rJson.data.link);

          imageTokens.push({
            type: 'image',
            value: { uri: rJson.data.link, ...dimensions },
          });
        }
      }

      const tokens = [...imageTokens, ...otherTokens];
      const { userId } = UserState.state;
      if (Constants.isDevice) {
        await registerForPushNotificationsAsync(userId, savePushTokenMutation);
      }

      if (this.props.replyOptions) {
        await newReplyMutation({
          variables: {
            replyTo: this.props.replyOptions.replyTo,
            userId,
            content: JSON.stringify(tokens),
            createdTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          },
        });
      } else {
        await newPostMutation({
          variables: {
            replyTo: null,
            userId,
            content: JSON.stringify(tokens),
            createdTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          },
        });
      }
      this.setState({ text: '', images: [] });
    } catch (e) {
      console.warn('Error: ' + e);
    } finally {
      this.setState({ isPosting: false });
      this.props.onPostSubmission();
    }
  };

  _keyboardDidShow = () => {
    this.exposeControls();
  };

  _keyboardDidHide = () => {
    this.exposeControls();
  };

  async componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

    this.clipboardScanHandle = setInterval(this.scanClipboardForLink, 500);

    const {
      data: { users },
      errors,
    } = await client.query({ query: GET_USERS });

    if (users) {
      this.setState({ users });
    }
  }

  componentWillUnmount() {
    clearInterval(this.clipboardScanHandle);

    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  scanClipboardForLink = async () => {
    let clipboardContent = await Clipboard.getString();

    if (isUrl(clipboardContent)) {
      if (!this.state.text.includes(clipboardContent)) {
        this.setState({ linkSuggestion: clipboardContent.trim() });
        this.exposeControls();
      }
    }
  };

  addLinkToPost = async (url) => {
    this.setState((state) => ({ text: state.text + ' ' + url, linkSuggestion: null }));
  };

  render() {
    let { image, text, isPosting } = this.state;
    let postingIsDisabled =
      isPosting || (this.state.images.length === 0 && text.trim().length === 0);

    const newReply = async (o) => {
      return await client.mutate({
        mutation: NewReply,
        variables: o.variables,
      });
    };

    const newPost = async (o) => {
      return await client.mutate({
        mutation: NewPost,
        variables: o.variables,
      });
    };

    const saveToken = async (o) => {
      return await client.mutate({
        mutation: SaveToken,
        variables: o.variables,
      });
    };

    return (
      <Container>
        <MaybeScroll innerRef={this.scrollViewRef}>
          {this.props.replyOptions ? (
            <Text
              style={{
                fontFamily: 'InterUI Italic',
                fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 16,
              }}>
              adding a reply to @{this.props.replyOptions.userId.split(':')[1]}'s post
            </Text>
          ) : null}
          <React.Fragment>
            {!this.state.isPosting
              ? this.state.images.map((image, i) => (
                  <ImageBackground
                    key={i}
                    source={{ uri: image.uri }}
                    style={{
                      marginBottom: 16,
                      alignItems: 'flex-end',
                      justifyContent: 'flex-start',
                      height: image.height,
                      width: image.width,
                    }}
                    resizeMode="contain">
                    <RemoveImageTouchable
                      onPress={() => {
                        this.setState((state) => ({
                          images: state.images.filter((_, y) => y !== i),
                        }));
                      }}>
                      <Feather name="x" color="white" size={12} />
                    </RemoveImageTouchable>
                  </ImageBackground>
                ))
              : null}

            <Input
              multiline
              autoFocus
              underlineColorAndroid="transparent"
              value={isPosting ? '' : text}
              onContentSizeChange={this.exposeControls}
              placeholder="Deep thoughts go here"
              onFocus={() => {
                this.exposeControls();
              }}
              placeholderTextColor="rgba(255,255,255,0.4)"
              onChangeText={(text) => {
                const words = text.split(' ');
                if (_.startsWith(words[words.length - 1], '@')) {
                  this.setState({ text, showMentionsAutocomplete: true });
                } else {
                  this.setState({ text, showMentionsAutocomplete: false });
                }
              }}
            />
          </React.Fragment>
          {this.state.linkSuggestion ? (
            <View style={{ marginTop: 24 }}>
              <Button
                tOpacity={0.3}
                style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
                onPress={() => this.addLinkToPost(this.state.linkSuggestion)}
                label="Add Link from Clipboard"
              />
            </View>
          ) : null}
          {this.state.showMentionsAutocomplete ? (
            <FlatList
              style={{ flex: 1, width: '100%', marginTop: 24 }}
              keyExtractor={(x) => {
                return `${x}`;
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              data={this.state.users.filter((u) => {
                const words = this.state.text.split(' ');
                const lastWord = words[words.length - 1];

                if (_.startsWith(handleFromUserId(u), lastWord)) {
                  return true;
                } else {
                  return false;
                }
              })}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState((state) => {
                        const words = state.text.split(' ');
                        words.pop();
                        words.push(handleFromUserId(item) + ' ');

                        return {
                          text: words.join(' '),
                          showMentionsAutocomplete: false,
                        };
                      });
                    }}
                    style={{
                      backgroundColor: colors.white20,
                      padding: 6,
                      borderRadius: 4,
                      marginRight: 4,
                    }}>
                    <Text style={{ color: 'white', fontFamily: 'InterUI' }}>
                      {handleFromUserId(item)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          ) : null}
          {this.state.showEmotePicker ? (
            <EmotePicker
              setEmote={(emoteText) =>
                this.setState((state) => ({ text: state.text + ' ' + emoteText + ' ' }))
              }
            />
          ) : null}
          <Toolbar>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity disabled={!!image} onPress={this._takePicture}>
                <Feather
                  name="aperture"
                  size={24}
                  color={!!image ? 'rgba(255,255,255,0.3)' : 'white'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!!image}
                onPress={this._pickImage}
                style={{
                  marginLeft: 20,
                }}>
                <Feather
                  name="image"
                  size={24}
                  color={!!image ? 'rgba(255,255,255,0.3)' : 'white'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.setState({ showEmotePicker: !this.state.showEmotePicker });
                  this.exposeControls();
                }}
                style={{
                  marginLeft: 20,
                }}>
                <Text style={{ fontSize: 24 }}>😂</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.setState({ showGifPicker: !this.state.showGifPicker });
                }}
                style={{
                  marginLeft: 20,
                }}>
                <Text style={{ fontSize: 24, color: 'white', fontFamily: 'InterUI Bold' }}>
                  GIF
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Button
                tOpacity={0.2}
                onPress={this.props.hide}
                label="❌"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <View style={{ width: 8 }} />
              <Button
                tOpacity={1}
                disabled={postingIsDisabled}
                onPress={this._submitAsync(newPost, saveToken, newReply)}
                isPosting={this.state.isPosting}
                label="🚀"
              />
            </View>
          </Toolbar>
        </MaybeScroll>
        {this.state.showGifPicker ? (
          <GiphyModal
            close={() => this.setState({ showGifPicker: false })}
            onGifSelect={(uri) =>
              this.setState((state) => ({
                text: state.text + ' ' + uri + ' ',
                showGifPicker: false,
              }))
            }
          />
        ) : null}
      </Container>
    );
  }
}

export default KeyboardAccessory;

const GET_EMOTES = gql`
  query getEmotes {
    emotes {
      ...EmoteFragment
    }
  }
  ${EmoteFragment}
`;

const Separator = () => <View style={{ height: 8 }} />;

class EmotePicker extends Component {
  render() {
    return (
      <Query query={GET_EMOTES} fetchPolicy="cache-and-network">
        {({ data, error, fetchMore, subscribeToMore, loading, refetch }) => {
          return (
            <FlatList
              style={{ flex: 1, width: '100%', marginTop: error ? 0 : 24 }}
              keyExtractor={(x) => {
                return `${x.name}`;
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              data={!loading && !error && data.emotes ? data.emotes : []}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    onPress={() => this.props.setEmote(item.name)}
                    style={{
                      backgroundColor: colors.white50,
                      padding: 4,
                      borderRadius: 12,
                      marginRight: 4,
                    }}>
                    <Image
                      fadeDuration={0}
                      resizeMode="contain"
                      source={{ uri: item.uri }}
                      style={{ width: 32, height: 32 }}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          );
        }}
      </Query>
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
    backgroundColor: 'white',
  },
  feed: { flex: 1, width: '100%', marginTop: 24 },
});
