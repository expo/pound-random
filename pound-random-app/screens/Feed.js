import React from 'react';
import { FlatList, Image, Text, TouchableHighlight, View } from 'react-native';
import Expo from 'expo';

export default class Feed extends React.Component {
  render() {
    return (
      <View style={{ marginTop: 50, flex: 1 }}>
        <FlatList
          data={[{ title: 'Title Text', key: 'item1' }]}
          renderItem={({ item, separators }) => (
            <TouchableHighlight
              onPress={() => this._onPress(item)}
              onShowUnderlay={separators.highlight}
              onHideUnderlay={separators.unhighlight}>
              <View style={{ backgroundColor: 'white' }}>
                <Text>{item.title}</Text>
              </View>
            </TouchableHighlight>
          )}
        />
      </View>
    );
  }

}
