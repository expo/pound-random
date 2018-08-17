import React from 'react';
import { ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import styled from 'styled-components';

import { RectButton } from 'react-native-gesture-handler';
import Feather from '@expo/vector-icons/Feather';

const Touchable = styled(Animated.createAnimatedComponent(TouchableOpacity))`
  background-color: ${({ disabled, tOpacity }) =>
    disabled ? 'rgba(255,255,255,0.1)' : `rgba(70, 48, 235, ${tOpacity})`};
  padding-vertical: 8px;
  padding-horizontal: 16px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
`;

const Text = styled.Text`
  color: ${({ disabled }) => (disabled ? 'rgba(255,255,255,0.2)' : 'white')};
  font-family: 'InterUI Medium';
`;

export default ({ onPress, disabled, isPosting, tOpacity, label, style, icon }) => (
  <Touchable disabled={disabled} onPress={onPress} tOpacity={tOpacity} style={style}>
    {isPosting ? (
      <ActivityIndicator size="small" color="white" />
    ) : (
      <React.Fragment>
        {icon ? (
          <Feather name={icon} size={24} color="white" />
        ) : (
          <Text disabled={disabled}>{label}</Text>
        )}
      </React.Fragment>
    )}
  </Touchable>
);
