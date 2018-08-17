import React, { Component, Fragment } from 'react';
import {
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WebBrowser, Video } from 'expo';
import moment from 'moment';

import isUrl from 'is-url';
import colors from '../../../colors';

const Divider = () => <View style={{ height: 16 }} />;

class TVideo extends Component {
  state = { playing: false, source: 0 };

  componentDidMount() {
    for (let index = 0; index < this.props.entity.video_info.variants.length; index++) {
      const element = this.props.entity.video_info.variants[index];

      if (element.content_type === 'video/mp4') {
        return this.setState({ source: index });
      }
    }
  }

  render() {
    return (
      <View
        activeOpacity={0.7}
        style={{
          borderRadius: 12,
        }}>
        {this.props.threadView ? (
          <Video
            source={{ uri: this.props.entity.video_info.variants[this.state.source].url }}
            resizeMode="cover"
            shouldPlay
            isLooping
            useNativeControls
            style={{
              height: (Dimensions.get('window').width - 56) / this.props.previewRatio,
              width: Dimensions.get('window').width - 56,
              borderRadius: 12,
            }}
            onError={(e) => this.tryNextSource()}
          />
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              if (!this.props.threadView) {
                this.props.navigation.navigate('Thread', { post: this.props.post });
              }
            }}>
            <ImageBackground
              source={{ uri: this.props.entity.media_url }}
              style={{
                height: (Dimensions.get('window').width - 56) / this.props.previewRatio,
                width: Dimensions.get('window').width - 56,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              imageStyle={{
                borderRadius: 12,
              }}
              resizeMode="contain">
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                }}
                onPress={async () => await Linking.openURL(this.props.entity.expanded_url)}>
                <Feather name="external-link" color="white" size={24} />
              </TouchableOpacity>
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 12,
                  backgroundColor: colors.black60,
                }}>
                <Feather name="play" color="white" size={24} style={{ marginLeft: 2 }} />
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

export default class Tweet extends Component {
  filteredText = (this.props.content.full_text || this.props.content.text)
    .split(' ')
    .filter((s) => !isUrl(s))
    .join(' ');
  content = (
    <Fragment>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`https://twitter.com/${this.props.content.user.screen_name}`)
          }>
          <Image
            source={{ uri: this.props.content.user.profile_image_url }}
            style={{ height: 36, width: 36, borderRadius: 18 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`https://twitter.com/${this.props.content.user.screen_name}`)
          }
          style={{ marginLeft: 8, flex: 1, justifyContent: 'space-between' }}>
          <Text style={{ color: 'white', fontFamily: 'InterUI Bold', fontSize: 18 }}>
            {this.props.content.user.name}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'InterUI', fontSize: 12 }}>
            @{this.props.content.user.screen_name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`https://twitter.com/x/status/${this.props.content.id_str}`)
          }>
          <Feather name="twitter" color="white" size={24} />
        </TouchableOpacity>
      </View>
      <Divider />
      {this.filteredText.trim().length ? (
        <Fragment>
          <Text style={{ color: 'white', fontFamily: 'InterUI', fontSize: 18 }}>
            {this.filteredText}
          </Text>
          <Divider />
        </Fragment>
      ) : null}
      {this.props.content.entities && this.props.content.entities.urls
        ? this.props.content.entities.urls.map((e, i) => (
            <Fragment key={i}>
              <TouchableOpacity
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'white',
                  borderRadius: 8,
                  backgroundColor: colors.white10,
                  padding: 8,
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
                onPress={async () => await Linking.openURL(e.expanded_url)}>
                <Feather
                  name="link"
                  size={16}
                  color={'white'}
                  style={{
                    marginRight: 8,
                  }}
                />
                <Text style={{ color: 'white', fontFamily: 'InterUI' }}>{e.expanded_url}</Text>
              </TouchableOpacity>
              <Divider />
            </Fragment>
          ))
        : null}
      {this.props.content.extended_entities && this.props.content.extended_entities.media
        ? this.props.content.extended_entities.media.map((e, i) => {
            if (e.type === 'photo') {
              const ratio = e.sizes.small.w / e.sizes.small.h;
              return (
                <Fragment key={i}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={async () => await Linking.openURL(e.media_url)}>
                    <Image
                      source={{ uri: e.media_url }}
                      style={{
                        height: (Dimensions.get('window').width - 56) / ratio,
                        width: Dimensions.get('window').width - 56,
                        alignSelf: 'center',
                        borderRadius: 12,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Divider />
                </Fragment>
              );
            } else if (e.type === 'video' || e.type === 'animated_gif') {
              const ratio = e.sizes.small.w / e.sizes.small.h;
              return (
                <Fragment key={i}>
                  <TVideo
                    threadView={this.props.threadView}
                    previewRatio={ratio}
                    theme={this.props.content.user.profile_background_color}
                    entity={e}
                    post={this.props.post}
                    navigation={this.props.navigation}
                  />
                  <Divider />
                </Fragment>
              );
            }
            return null;
          })
        : null}
      <Text style={{ fontFamily: 'InterUI', fontSize: 12, color: colors.white70, marginBottom: 4 }}>
        {moment(this.props.content.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY').format(
          'h:mm A - D MMM YYYY'
        )}
      </Text>
    </Fragment>
  );

  render() {
    return (
      <View
        style={{
          marginHorizontal: 16,
          padding: 12,
          borderRadius: 12,
          backgroundColor: '#1b2836',
        }}>
        {this.content}
      </View>
    );
  }
}
