import gql from 'graphql-tag';

export const PostFragment = gql`
  fragment PostFragment on Post {
    postId
    content
    userId
    replyTo
    ts
    createdTime
  }
`;

export const ReactionFragment = gql`
  fragment ReactionFragment on Reaction {
    vote
    reactionId
    userId
    postId
  }
`;

export const EmoteFragment = gql`
  fragment EmoteFragment on Emote {
    name
    uri
  }
`;

export const NotificationFragment = gql`
  fragment NotificationFragment on Notification {
    postId
    userId
    body
    createdTime
  }
`;
