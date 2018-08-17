import React, { Component } from 'react';
import { Platform, View, Linking } from 'react-native';
import { WebBrowser, LinearGradient } from 'expo';
import Touchable from './Touchable';
import { Feather } from '@expo/vector-icons';
import ImagePreview from './ImagePreview';
import TitleRow from './TitleRow';
import Icon from './Icon';
import Title from './Title';
import Description from './Description';
import colors from '../../../colors';

export default class Link extends Component {
  state = { iconErrored: false, imageErrored: false };
  render() {
    const { icon, title, description, uri, image, last } = this.props;
    const imageIsPresent = image && !this.state.imageErrored;
    return (
      <Touchable
        underlayColor="white"
        last={last}
        activeOpacity={0.85}
        onPress={async () => await Linking.openURL(uri)}>
        <ImagePreview
          imageIsPresent={imageIsPresent}
          imageStyle={{
            borderRadius: 12,
          }}
          fadeDuration={0}
          source={{
            uri: imageIsPresent ? image : undefined,
          }}
          onError={() => {
            this.setState({ imageErrored: true });
          }}
          resizeMode={'cover'}>
          <LinearGradient
            colors={
              imageIsPresent
                ? ['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.85)']
                : ['black', 'black']
            }
            style={{
              flex: 1,
              width: '100%',
              borderRadius: 12,
              justifyContent: 'flex-end',
              backgroundColor: colors.black30,
            }}>
            <View style={{ flexDirection: 'row', paddingVertical: 16, alignItems: 'center' }}>
              {!!icon && !this.state.iconErrored ? (
                <Icon
                  source={{ uri: icon }}
                  onError={() => {
                    this.setState({ iconErrored: true });
                  }}
                />
              ) : (
                <Feather
                  name="link"
                  size={20}
                  color={'white'}
                  style={{
                    paddingHorizontal: 16,
                  }}
                />
              )}
              <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginRight: 48 }}>
                <Title>{title ? title : uri}</Title>
              </View>
            </View>
          </LinearGradient>
        </ImagePreview>
        <TitleRow />
      </Touchable>
    );
  }
}
