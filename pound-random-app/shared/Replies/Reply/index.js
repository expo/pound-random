import React, { Component } from 'react';
import moment from 'moment';
import { View, Text, Alert, Dimensions, Image, TouchableOpacity, Clipboard } from 'react-native';
import WebURL from './WebURL';
import colors from '../../../colors';
import Container from './Container';
import { Feather } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';
import MetadataRow from './MetadataRow';
import Username from './Username';
import CreationTime from './CreationTime';
import Row from './Row';
import TextContent from './TextContent';
import api from '../../../Api';

export default withNavigation(
  class Reply extends Component {
    filteredContent = this.props.content.filter((o) => {
      if (o.type === 'text' && o.value.trim() === '') return false;
      return true;
    });

    content = (
      <React.Fragment>
        {this.filteredContent.map((o, i) => {
          const last = i === this.filteredContent.length - 1;

          switch (o.type) {
            case 'link':
              return <WebURL key={i} uri={o.value.uri} last={last} />;
            case 'image':
              const maxHeight = Dimensions.get('window').height;
              const maxWidth = Dimensions.get('window').width - 32;

              const ratio = maxWidth / o.value.width;

              const width = o.value.width * ratio;
              const height = o.value.height * ratio;

              return (
                <Image
                  key={i}
                  fadeDuration={0}
                  source={{ uri: o.value.uri }}
                  style={{
                    marginTop: 8,
                    marginBottom: last ? 0 : 8,
                    borderRadius: 8,
                    height,
                    width,
                    alignSelf: 'center',
                  }}
                  resizeMode="cover"
                />
              );
            case 'video':
              return <WebURL last={last} key={i} uri={o.value.uri} />;
            case 'tweet':
              return (
                <WebURL
                  last={last}
                  key={i}
                  uri={`https://twitter.com/x/status/${o.value.id_str}`}
                />
              );
            case 'text':
              return <TextContent last={last} key={i} content={o.value.trim()} />;
            default:
              return null;
          }
        })}
      </React.Fragment>
    );

    render() {
      const { postId, userId, myUserId, createdTime, deletePost, refetch } = this.props;

      return (
        <Container
          activeOpacity={0.99}
          onLongPress={() => {
            Alert.alert(
              'Copy Text',
              'Would you like to copy the text from this post to your clipboard?',
              [
                { text: 'Cancel', onPress: () => null, style: 'cancel' },
                {
                  text: 'OK',
                  onPress: () => {
                    const s = [];
                    for (const token of this.filteredContent) {
                      if (token.type === 'text') {
                        s.push(token.value);
                      } else if (token.type === 'link') {
                        s.push(token.value.uri);
                      }
                    }
                    Clipboard.setString(s.join(' '));
                  },
                },
              ]
            );
          }}>
          <MetadataRow>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile', { userId })}>
              <Username>@{userId.split(':')[1]}</Username>
            </TouchableOpacity>
            {/* <CreationTime>{moment.utc(createdTime).format('M/D/YYYY, h:mm a')}</CreationTime> */}
            {userId === myUserId ? (
              <TouchableOpacity
                onPress={async () => {
                  if (userId === myUserId) {
                    Alert.alert(
                      'Manage Reply',
                      'Would you like to delete this reply?',
                      [
                        { text: 'Cancel', onPress: () => null, style: 'cancel' },
                        {
                          text: 'OK',
                          onPress: async () => {
                            await deletePost({
                              variables: {
                                postId,
                                userId,
                              },
                            });
                            await refetch();
                          },
                        },
                      ],
                      { cancelable: false }
                    );
                  }
                }}
                style={{
                  alignSelf: 'flex-end',
                }}>
                <Feather name="trash-2" color="black" size={16} />
              </TouchableOpacity>
            ) : null}
          </MetadataRow>
          <Row>{this.content}</Row>
        </Container>
      );
    }
  }
);
