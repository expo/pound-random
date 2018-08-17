import React from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import assets from '../assets';

export default class Watermark extends React.Component {
  state = {
    opacityAV: new Animated.Value(0.2),
  };

  pulseAnimation = Animated.loop(
    Animated.sequence([
      Animated.timing(this.state.opacityAV, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.opacityAV, {
        toValue: 0.15,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  );

  componentDidMount() {
    this.pulseAnimation.start();
  }

  componentWillUnmount() {
    this.pulseAnimation.stop();
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.props.refetch}
        activeOpacity={1}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.Image
          source={assets.icons.watermark}
          style={{ opacity: this.state.opacityAV, width: '55%' }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  }
}
