import React from 'react';
import {
  AsyncStorage,
  FlatList,
  StatusBar,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  View,
  Platform,
} from 'react-native';
import { createStackNavigator, SafeAreaView } from 'react-navigation';
import Home from './screens/Home';
import Notifications from './screens/Notifications';
import Likes from './screens/Likes';
import Profile from './screens/Profile';
import Thread from './screens/Thread';
import EmotesList from './screens/EmotesList';
import { Constants, AppLoading, Font, Updates } from 'expo';
import colors from './colors';
import assets from './assets';
import api, { PRODUCTION_API_BASE_URL, PRODUCTION_WS_URL } from './Api';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import Sentry from 'sentry-expo';
import { Provider as UnstatedProvider } from 'unstated';
import userState from './UserState';
import { ApolloClient } from 'apollo-client';
import { split, ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

Sentry.config('https://45beb7705a664aae885c3f81e3fd6555@sentry.io/1244317').install();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'black',
    accent: colors.expo,
  },
};

const cache = new InMemoryCache();

const httpLink = new HttpLink({
  uri: PRODUCTION_API_BASE_URL,
});

const wsLink = new WebSocketLink({
  uri: PRODUCTION_WS_URL,
  options: {
    reconnect: true,
  },
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

persistCache({
  cache,
  storage: AsyncStorage,
});

export const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    wsLink,
  ]),
  cache,
});

const Main = createStackNavigator(
  { Home, Notifications, Thread, EmotesList, Likes, Profile },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
    mode: 'card',
    cardStyle: { shadowColor: 'transparent' },
  }
);

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.navigatorRef = React.createRef();
  }
  state = {
    isReady: false,
    hasPromptedForUpdate: false,
  };

  startAsync = async () => {
    await Font.loadAsync(assets.fonts);
  };

  componentDidMount() {
    if (!__DEV__) {
      const h = setInterval(async () => {
        const { isAvailable } = await Updates.checkForUpdateAsync();

        if (isAvailable && !this.state.hasPromptedForUpdate) {
          clearInterval(h);
          this.setState({ hasPromptedForUpdate: true });
          Alert.alert(
            'Update Available',
            'Would you like update to the latest version of Blue?',
            [
              {
                text: 'Cancel',
                onPress: () => null,
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: async () => {
                  await Updates.fetchUpdateAsync();
                  Updates.reload();
                },
              },
            ],
            { cancelable: false }
          );
        }
      }, 5000);
    }
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this.startAsync}
          onFinish={() => {
            this.setState({ isReady: true });
          }}
          onError={console.warn}
        />
      );
    }

    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: 'black',
        }}
        forceInset={{ top: Platform.OS === 'android' ? 'never' : 'always' }}>
        {Platform.OS === 'ios' ? (
          <View
            style={{
              backgroundColor: 'black',
              top: 0,
              left: 0,
              right: 0,
              height: Constants.statusBarHeight,
              position: 'absolute',
              zIndex: 100,
            }}
          />
        ) : null}
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <UnstatedProvider inject={[userState]}>
          <ApolloProvider client={client}>
            <PaperProvider theme={theme}>
              <Main
                ref={this.navigatorRef}
                screenProps={{ notification: this.props.exp.notification }}
              />
            </PaperProvider>
          </ApolloProvider>
        </UnstatedProvider>
      </SafeAreaView>
    );
  }
}
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
});
