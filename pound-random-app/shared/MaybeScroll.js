import React from 'react';
import { ScrollView } from 'react-native';

export default (props) => (
  <ScrollView
    ref={props.innerRef}
    contentContainerStyle={{ flexGrow: 1 }}
    alwaysBounceVertical={false}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="always"
    {...props}>
    {props.children}
  </ScrollView>
);
