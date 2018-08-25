import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { EmoteFragment } from '../../../fragments';
import colors from '../../../colors';
import { userIdFromHandle } from '../../../helpers';

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
  margin-top: 4px;
  align-items: center;
`;

const Emote = styled.Image`
  height: 32px;
  width: 32px;
  margin-right: 4px;
`;

const Text = styled.Text`
  font-size: 14px;
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
                  <React.Fragment key={i}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('Profile', { userId: userIdFromHandle(word.trim()) })
                      }
                      style={{ backgroundColor: colors.lilaLighter, borderRadius: 4, padding: 2 }}>
                      <Text style={{ color: colors.expo }}>{word}</Text>
                    </TouchableOpacity>
                    <Text style={{ color: colors.expo }}>
                      {i !== content.split(' ').length - 1 ? ' ' : ''}
                    </Text>
                  </React.Fragment>
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
