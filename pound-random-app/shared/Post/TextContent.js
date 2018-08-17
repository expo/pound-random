import React from 'react';
import styled from 'styled-components';
import { TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import gql from 'graphql-tag';
import _ from 'lodash';
import { Query } from 'react-apollo';
import { EmoteFragment } from '../../fragments';
import colors from '../../colors';
import { userIdFromHandle } from '../../helpers';

const GET_EMOTES = gql`
  query getEmotes {
    emotes {
      ...EmoteFragment
    }
  }
  ${EmoteFragment}
`;

const Container = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 16px;
  align-items: center;
`;

const Emote = styled.Image`
  width: 48px;
  height: 48px;
  margin-right: 4px;
`;

const Text = styled.Text`
  font-size: 16px;
  font-family: 'InterUI Medium';
  color: black;
`;

export default withNavigation(({ content, navigation }) => {
  return (
    <Query query={GET_EMOTES} fetchPolicy="cache-and-network">
      {({ data, error, fetchMore, subscribeToMore, loading, refetch }) => {
        const emotes = data.emotes || [];
        const keywords = emotes.map((o) => o.name);

        return (
          <Container>
            {content.split(' ').map((word, i) => {
              if (keywords.includes(word)) {
                return (
                  <Emote
                    key={i}
                    source={{ uri: _.find(emotes, (o) => o.name === word).uri }}
                    resizeMode="contain"
                  />
                );
              } else if (_.startsWith(word, '@') && word !== '@') {
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      navigation.navigate('Profile', { userId: userIdFromHandle(word.trim()) })
                    }>
                    <Text style={{ color: colors.expo }}>
                      {word}
                      {i !== content.split(' ').length - 1 ? ' ' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              } else {
                return i !== content.split(' ').length - 1 ? (
                  <Text key={i}>{word} </Text>
                ) : (
                  <Text key={i}>{word}</Text>
                );
              }
            })}
          </Container>
        );
      }}
    </Query>
  );
});
