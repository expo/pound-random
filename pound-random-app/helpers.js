import { Image, Dimensions, Alert } from 'react-native';
import _ from 'lodash';
import { Permissions, Notifications } from 'expo';
import isUrl from 'is-url';
import { client } from './App';
import gql from 'graphql-tag';
import URL from 'url-parse';
import { FetchCache } from './FetchCache';

const LinkInfoQuery = gql`
  query($link: String) {
    getInfoFor(link: $link) {
      metadata {
        icon
        title
        description
        image
      }
    }
  }
`;

const TweetQuery = gql`
  query($id: ID!) {
    tweet(id: $id) {
      created_at
      id_str
      text
      user
      full_text
      truncated
      place
      entities
      extended_entities
      extended_tweet
    }
  }
`;

export const handleFromUserId = (u) => `@${u.split(':')[1]}`;

export const userIdFromHandle = (h) => `user:${h.split('@')[1]}`;

export const tokenizeContent = async (text) => {
  const tokens = [];
  let continuousTextStream = [];

  const flushText = () => {
    if (continuousTextStream.length) {
      tokens.push({ type: 'text', value: _.join(continuousTextStream, ' ') });
      continuousTextStream = [];
    }
  };

  const splitString = _.split(text.trim().replace(/\n/g, ' '), ' ');

  for (const chunk of splitString) {
    if (isUrl(chunk)) {
      flushText();

      try {
        const dimensions = await getSize(chunk);

        if (
          JSON.stringify(dimensions.height) === 'null' ||
          JSON.stringify(dimensions.width) === 'null'
        ) {
          throw 'not an image';
        }

        tokens.push({
          type: 'image',
          value: {
            uri: chunk,
            ...dimensions,
          },
        });
      } catch (e) {
        const url = URL(chunk, true);

        if (
          (url.host === 'twitter.com' || url.host === 'mobile.twitter.com') &&
          url.pathname.includes('/status/')
        ) {
          const parts = url.pathname.split('/');
          const id = parts[parts.length - 1];

          const {
            data: { tweet },
          } = await client.query({ query: TweetQuery, variables: { id } });

          tokens.push({
            type: 'tweet',
            value: tweet,
          });
        } else if (
          ((url.host === 'youtube.com' ||
            url.host === 'm.youtube.com' ||
            url.host === 'www.youtube.com') &&
            url.query.v) ||
          (url.host === 'youtu.be' && url.pathname.length !== 0)
        ) {
          const yJSON = await FetchCache.get(
            `https://www.youtube.com/oembed?url=${url.href}&format=json`
          );

          const value = {
            cover: yJSON.thumbnail_url,
            title: yJSON.title,
            uri: url.href,
            height: yJSON.height,
            width: yJSON.width,
          };

          tokens.push({
            type: 'youtube',
            value,
          });
        } else {
          let {
            data: {
              getInfoFor: { metadata },
            },
          } = await client.query({ query: LinkInfoQuery, variables: { link: chunk } });

          tokens.push({
            type: 'link',
            value: {
              uri: chunk,
              icon: metadata.icon,
              title: metadata.title,
              description: metadata.description,
              image: metadata.image,
            },
          });
        }
      }
    } else {
      continuousTextStream.push(chunk);
    }
  }

  flushText();

  return tokens;
};

export const getSize = async (uri) => {
  return new Promise((resolve, reject) => {
    try {
      Image.getSize(
        uri,
        (srcWidth, srcHeight) => {
          const maxHeight = Dimensions.get('window').height;
          const maxWidth = Dimensions.get('window').width;

          const ratio = maxWidth / srcWidth;

          resolve({
            width: srcWidth * ratio,
            height: srcHeight * ratio,
          });
        },
        (error) => {
          reject(error);
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

export const formDataForBase64 = (base64) => {
  const formData = new FormData();
  formData.append('image', base64);
  return formData;
};

export const postFormDataToImgur = async (formData) => {
  let clientId = 'd722cc601b3039c';
  let token = false;
  let auth;
  if (token) {
    auth = 'Bearer ' + token;
  } else {
    auth = 'Client-ID ' + clientId;
  }

  return fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: auth,
      Accept: 'application/json',
    },
  });
};

export const registerForPushNotificationsAsync = async (userId, savePushTokenMutation) => {
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
};
