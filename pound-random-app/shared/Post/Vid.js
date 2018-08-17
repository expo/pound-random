import React, { Component, PureComponent } from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import { Video } from 'expo';

export default class Vid extends React.Component {
  myRef = React.createRef();
  state = { isMuted: true };

  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={async () => {
          this.setState((state) => ({ isMuted: !state.isMuted }));
        }}
        onLongPress={async () => {
          await this.myRef.current.presentFullscreenPlayer();
        }}>
        <Video
          source={{ uri: this.props.uri }}
          rate={1.0}
          ref={this.myRef}
          volume={1.0}
          isMuted={this.state.isMuted}
          shouldPlay
          isLooping
          resizeMode="contain"
          style={{
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').width / (16 / 9),
          }}
        />
      </TouchableOpacity>
    );
  }
}
