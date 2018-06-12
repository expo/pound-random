import React from 'react';
import { Text, View } from 'react-native';
import Expo from 'expo';

import QRCodeUrlReader from '../QRCodeUrlReader';

export default class MiscSettings extends React.Component {
  render() {
    return (
      <View>
        <Text>This is Misc Settings</Text>
        <QRCodeUrlReader />
      </View>
    );
  }
}