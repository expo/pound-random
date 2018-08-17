import React, { Component, PureComponent } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Image,
  Dimensions,
  View,
  Alert,
  TextInput,
  ActivityIndicator,
  AsyncStorage,
  TouchableOpacity,
  Platform,
  FlatList,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Constants, ImagePicker, Permissions } from 'expo';
import _ from 'lodash';
import colors from '../colors';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import Header from '../shared/Header';
import MaybeScroll from '../shared/MaybeScroll';
import { formDataForBase64, postFormDataToImgur } from '../helpers';
import { EmoteFragment } from '../fragments';

const CREATE_EMOTE = gql`
  mutation createEmote($name: ID!, $uri: String!) {
    createEmote(name: $name, uri: $uri) {
      ...EmoteFragment
    }
  }
  ${EmoteFragment}
`;

const GET_EMOTES = gql`
  query getEmotes {
    emotes {
      ...EmoteFragment
    }
  }
  ${EmoteFragment}
`;

const Separator = () => <View style={{ height: 8 }} />;

export default class EmotesList extends PureComponent {
  static navigationOptions = {
    header: null,
  };

  state = {
    newEmoteName: '',
    image: null,
    isPosting: false,
  };

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
      quality: 0,
      allowsEditing: true,
      aspect: [1, 1],
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
          image: {
            width: srcWidth * ratio,
            height: srcHeight * ratio,
            uri: uri,
            base64: base64,
          },
        }));
      },
      (error) => {
        console.log('error:', error);
      }
    );
  };

  _submitAsync = (newEmoteMutation, refetch) => async () => {
    this.setState({ isPosting: true });

    const formData = formDataForBase64(this.state.image.base64);

    let response = await postFormDataToImgur(formData);

    const rJson = await response.json();

    if (rJson.success) {
      await newEmoteMutation({
        variables: { uri: rJson.data.link, name: this.state.newEmoteName },
      });
      this.setState({ isPosting: false, image: null, newEmoteName: '' });
      await refetch();
    }
  };

  renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          justifyContent: 'space-between',
          width: '80%',
        }}>
        <Text
          style={{
            fontFamily: 'InterUI',
            fontSize: 16,
            color: 'black',
            textAlign: 'left',
          }}>
          {item.name}
        </Text>
        <Image
          fadeDuration={0}
          resizeMode="contain"
          source={{ uri: item.uri }}
          style={{ width: 56, height: 56 }}
        />
      </View>
    );
  };

  render() {
    return (
      <Query query={GET_EMOTES} fetchPolicy="cache-and-network">
        {({ data, error, fetchMore, subscribeToMore, loading, refetch }) => {
          return (
            <Mutation mutation={CREATE_EMOTE}>
              {(createEmote) => (
                <KeyboardAvoidingView
                  behavior={!__DEV__ ? 'padding' : Platform.OS === 'ios' ? 'padding' : null}
                  style={styles.keyboardAvoidingView}
                  keyboardVerticalOffset={Constants.statusBarHeight}>
                  <View style={styles.container}>
                    <Header label="Emotes" navigation={this.props.navigation} />
                    <FlatList
                      scrollsToTop
                      style={styles.feed}
                      keyExtractor={(x) => {
                        return `${x.name}`;
                      }}
                      refreshing={loading}
                      onRefresh={refetch}
                      keyboardShouldPersistTaps="always"
                      windowSize={3}
                      removeClippedSubviews
                      ListHeaderComponent={() => <View style={{ height: 8 }} />}
                      ListFooterComponent={() => <View style={{ height: 8 }} />}
                      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                      data={!loading && !error && data.emotes ? data.emotes : []}
                      renderItem={this.renderItem}
                      ItemSeparatorComponent={Separator}
                    />
                    <View style={{ padding: 8, backgroundColor: 'black', width: '100%' }}>
                      <Text
                        style={{
                          color: 'white',
                          fontFamily: 'InterUI Medium',
                          marginBottom: this.state.image ? 8 : 0,
                        }}>
                        Create New Emote
                      </Text>
                      {this.state.image ? (
                        <Image
                          source={{ uri: this.state.image.uri }}
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 56,
                            width: 56,
                          }}
                          resizeMode="contain"
                        />
                      ) : null}
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <TextInput
                          placeholder="EmoteName"
                          underlineColorAndroid="transparent"
                          style={{
                            marginTop: 8,
                            flex: 1,
                            color: 'white',
                            fontSize: 16,
                            fontFamily: 'InterUI',
                          }}
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          value={this.state.newEmoteName}
                          onChangeText={(text) => this.setState({ newEmoteName: text.trim() })}
                        />
                        <TouchableOpacity
                          onPress={this._pickImage}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            backgroundColor: colors.white20,
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text style={{ color: 'white', fontFamily: 'InterUI Medium' }}>
                            Choose Image
                          </Text>
                        </TouchableOpacity>
                        {this.state.newEmoteName.length > 3 && !!this.state.image ? (
                          <TouchableOpacity
                            disable={this.state.isPosting}
                            onPress={this._submitAsync(createEmote, refetch)}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 16,
                              backgroundColor: colors.white20,
                              borderRadius: 8,
                              marginLeft: 4,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            {this.state.isPosting ? (
                              <ActivityIndicator color="white" size="small" />
                            ) : (
                              <Text style={{ color: 'white', fontFamily: 'InterUI Medium' }}>
                                Submit
                              </Text>
                            )}
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              )}
            </Mutation>
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
  feed: { flex: 1, width: '100%' },
});
