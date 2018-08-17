import React from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  AsyncStorage,
  TouchableOpacity,
  FlatList,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default ({ label, navigation }) => (
  <View
    style={{
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'black',
      justifyContent: 'space-between',
      width: '100%',
    }}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Feather name="arrow-left" color="white" size={24} />
    </TouchableOpacity>
    <Text
      style={{
        fontFamily: 'InterUI Bold',
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
      }}>
      {label}
    </Text>
    <View style={{ width: 24 }} />
  </View>
);
