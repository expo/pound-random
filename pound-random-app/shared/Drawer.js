import React from 'react';
import { TouchableOpacity, View, Image, Text, ScrollView, Alert, AsyncStorage } from 'react-native';
import _ from 'lodash';
import colors from '../colors';
import { Permissions, Notifications, Constants } from 'expo';
import { Feather } from '@expo/vector-icons';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import { client } from '../App';
import { RectButton } from 'react-native-gesture-handler';

const GetToken = gql`
  query($userId: String) {
    getPushToken(userId: $userId) {
      token
    }
  }
`;

const SaveToken = gql`
  mutation saveToken($userId: String, $token: String) {
    writePushToken(userId: $userId, token: $token) {
      userId
      token
    }
  }
`;

async function registerForPushNotificationsAsync(userId, savePushTokenMutation) {
  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    Alert.alert(
      'Stay in The Loop',
      'Would you like to receive notifications related to your posts?',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
            if (finalStatus !== 'granted') {
              return;
            }

            let token = await Notifications.getExpoPushTokenAsync();
            // write to db
            await savePushTokenMutation({ variables: { token, userId } });
          },
        },
      ],
      { cancelable: false }
    );
  } else {
    let token = await Notifications.getExpoPushTokenAsync();

    await savePushTokenMutation({ variables: { token, userId } });
  }
}

export default ({ opCount, userId, drawerLayoutRef, setState, navigation }) => {
  const DrawerItem = ({ label, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Text
        style={{
          fontSize: 18,
          marginTop: 24,
          marginLeft: 24,
          fontFamily: 'InterUI Medium',
        }}>
        {_.toUpper(label)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Query query={GetToken} variables={{ userId }} fetchPolicy="cache-and-network">
      {({ loading, refetch, data, error }) => (
        <View
          style={{
            flex: 1,
          }}>
          {userId ? (
            <View
              style={{
                alignItems: 'center',
                width: '100%',
                backgroundColor: 'black',
              }}>
              <Text
                style={{
                  color: 'white',
                  marginVertical: 16,
                  fontSize: 24,
                  fontFamily: 'InterUI Medium',
                }}>
                {userId && userId.split(':')[1]}
              </Text>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'center',
                  }}>
                  <Feather name="message-circle" color="white" size={32} />
                  <View style={{ alignItems: 'center', marginLeft: 4 }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 24,
                        fontFamily: 'InterUI Medium',
                      }}>
                      {opCount}
                    </Text>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 12,
                        fontFamily: 'InterUI',
                      }}>
                      posts
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'space-between',
              paddingBottom: 24,
            }}
            alwaysBounceVertical={false}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}>
            <View>
              {userId ? (
                <DrawerItem
                  label="Likes"
                  onPress={() => {
                    navigation.navigate('Likes');
                  }}
                />
              ) : null}
              {userId ? (
                <DrawerItem
                  label="Notifications"
                  onPress={() => {
                    navigation.navigate('Notifications');
                  }}
                />
              ) : null}
              <DrawerItem
                label="Emotes"
                onPress={() => {
                  navigation.navigate('EmotesList');
                }}
              />
            </View>
            {userId ? (
              <React.Fragment>
                {!loading && !error && !data.getPushToken ? (
                  <DrawerItem
                    label="Enable Push Notifications"
                    onPress={() => {
                      if (Constants.isDevice) {
                        registerForPushNotificationsAsync(userId, async (o) => {
                          return await client.mutate({
                            mutation: SaveToken,
                            variables: o.variables,
                          });
                        });
                      }
                    }}
                  />
                ) : null}
                <DrawerItem
                  label="Log out"
                  onPress={() => {
                    Alert.alert(
                      'Log out',
                      'Are you sure?',
                      [
                        {
                          text: 'Cancel',
                          onPress: () => null,
                          style: 'cancel',
                        },
                        {
                          text: 'OK',
                          onPress: () => {
                            AsyncStorage.removeItem('sessions').then(() => {
                              navigation.replace('Home', null, null, Math.random().toString());
                            });
                          },
                        },
                      ],
                      { cancelable: false }
                    );
                  }}
                />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <DrawerItem
                  label="Sign in"
                  onPress={() => {
                    drawerLayoutRef.current.closeDrawer();
                    setState({ showAuthForm: true });
                  }}
                />
              </React.Fragment>
            )}
          </ScrollView>
        </View>
      )}
    </Query>
  );
};
