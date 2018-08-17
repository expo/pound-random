import React from 'react';
import { TouchableOpacity, Linking } from 'react-native';
import styled from 'styled-components';
import colors from '../../../colors';

const Text = styled.Text`
  font-size: 14px;
  margin-top: 4px;
  color: black;
  text-decoration-line: underline;
  font-family: 'InterUI Medium';
`;

export default ({ uri }) => (
  <TouchableOpacity onPress={async () => await Linking.openURL(uri)}>
    <Text>{uri}</Text>
  </TouchableOpacity>
);
