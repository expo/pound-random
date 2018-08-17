const post = require('./post');
const links = require('./links');
const reaction = require('./reaction');
const login = require('./login');
const signup = require('./signup');
const db = require('./db');
const lodash = require('lodash');
const emotes = require('./emotes');
const user = require('./user');
const twitter = require('./twitter');
const push = require('./push');
const typeDefs = require('./typeDefs');
const fetch = require('node-fetch');
const resolvers = require('./resolvers');

module.exports = {
  Query: {
    feed: async (_, args) => {
      return await post.buildFeedAsync();
    },
    post: async (_, { id }) => await post.getPostAsync(id),
    replies: async (_, { to }) => {
      return await post.getRepliesToPost(to);
    },
    getInfoFor: async (_, { link }) => await links.infoForLinkAsync(link),
    doesUsernameExist: async (_, { username }) => await signup.doesUsernameExist(username),
    parseWeb: async (_, { url }) => {
      const response = await fetch(`https://mercury.postlight.com/parser?url=${url}`, {
        headers: {
          'x-api-key': '8VeOMg1JCoXkCbpy95eIluwHiKG4mtBkAgXzMeOI',
        },
      });
      return await response.json();
    },
    update: async (_, {}) => {
      try {
        await spawnAsync('/root/update');
        return true;
      } catch (e) {
        return false;
      }
    },
    getPushToken: async (_, { userId }) => await push.getTokenAsync(userId),
    reactions: async (_, { postId }) => await reaction.getReactionsToPost(postId),
    likes: async (_, { userId }) => await reaction.getUsersLikes(userId),
    notifications: async (_, { userId }) =>
      await db.queryAsync('SELECT * from notification WHERE userId = ? ORDER BY createdTime DESC', [
        userId,
      ]),
    emotes: async (_, args) => await emotes.getEmotes(),
    tweet: async (_, { id }) => await twitter.getTweet(id),
    postsFrom: async (_, { userId }) => await post.getUsersPosts(userId),
    users: async (_, {}) => await user.getAllUserIds(),
  },
  Mutation: {
    deletePost: async (_, { postId, userId }, { pubsub }) => {
      let p = await post.getPostAsync(postId);
      await post.deletePostAsync(postId, userId);

      pubsub.publish('postDeleted', { postDeleted: p });

      return p;
    },
    createPost: async (_, { userId, content, replyTo, createdTime }, { pubsub }) => {
      const kontent = JSON.parse(content);

      const result = await post.getPostAsync(
        await post.newPostAsync(userId, content, replyTo, createdTime)
      );

      const users = await db.queryAsync('SELECT ALL userId FROM user');

      for (const user of users) {
        if (user.userId !== userId) {
          if (kontent[0].type === 'text') {
            await push.sendNotificationAsync(
              [user.userId],
              `@${userId.split(':')[1]} just created a post: "${kontent[0].value.trim()}"`,
              result.postId
            );
          } else {
            await push.sendNotificationAsync(
              [user.userId],
              `@${userId.split(':')[1]} just created a post! Check it out!`,
              result.postId
            );
          }
        }
      }

      let mentions = [];

      for (const token of kontent) {
        if (token.type === 'text') {
          mentions = [...mentions, ...push.extract(token.value, { unique: true, symbol: false })];
        }
      }

      for (const mention of mentions) {
        const mentionUserId = `user:${mention.trim()}`;

        if (mentionUserId !== userId) {
          if (kontent[0].type === 'text') {
            await push.sendNotificationAsync(
              [mentionUserId],
              `@${userId.split(':')[1]} just mentioned you in a post: "${kontent[0].value.trim()}"`,
              result.postId
            );
          } else {
            await push.sendNotificationAsync(
              [mentionUserId],
              `@${userId.split(':')[1]} just mentioned you in a post! Check it out!`,
              result.postId
            );
          }
        }
      }

      pubsub.publish('postCreated', { postCreated: result });

      return result;
    },
    createReply: async (_, { userId, content, replyTo, createdTime }, { pubsub }) => {
      const kontent = JSON.parse(content);

      const postId = await post.newPostAsync(userId, content, replyTo, createdTime);
      const reply = await post.getPostAsync(postId);
      const parentPost = await post.getPostAsync(replyTo);
      const replies = await post.getRepliesToPost(parentPost.postId);

      if (userId !== parentPost.userId) {
        if (kontent[0].type === 'text') {
          await push.sendNotificationAsync(
            [parentPost.userId],
            `@${userId.split(':')[1]} just replied to your post: "${kontent[0].value.trim()}"`,
            postId
          );
        } else {
          await push.sendNotificationAsync(
            [parentPost.userId],
            `@${userId.split(':')[1]} just replied to your post!`,
            postId
          );
        }
      }

      const participants = lodash.uniq(replies.map((r) => r.userId));

      for (const p of participants) {
        if (p !== userId && p !== parentPost.userId) {
          if (kontent[0].type === 'text') {
            await push.sendNotificationAsync(
              [p],
              `@${userId.split(':')[1]} just replied in your conversation about @${
                parentPost.userId.split(':')[1]
              }'s post: "${kontent[0].value.trim()}"`,
              postId
            );
          } else {
            await push.sendNotificationAsync(
              [p],
              `@${userId.split(':')[1]} just replied in your conversation about @${
                parentPost.userId.split(':')[1]
              }'s post!`,
              postId
            );
          }
        }
      }

      let mentions = [];

      for (const token of JSON.parse(content)) {
        if (token.type === 'text') {
          mentions = [...mentions, ...push.extract(token.value, { unique: true, symbol: false })];
        }
      }

      for (const mention of mentions) {
        const mentionUserId = `user:${mention.trim()}`;

        if (mentionUserId !== userId) {
          if (kontent[0].type === 'text') {
            await push.sendNotificationAsync(
              [mentionUserId],
              `@${
                userId.split(':')[1]
              } just mentioned you in a reply: "${kontent[0].value.trim()}"`,
              postId
            );
          } else {
            await push.sendNotificationAsync(
              [mentionUserId],
              `@${userId.split(':')[1]} just mentioned you in a reply! Check it out!`,
              postId
            );
          }
        }
      }

      pubsub.publish(`replyAdded-${parentPost.postId}`, { replyAdded: reply });

      return reply;
    },
    createSession: async (_, { mobileNumber, loginCode }) => {
      const s = await login.checkCodeForMobileNumberAsync(mobileNumber, loginCode);
      return s;
    },
    login: async (_, { mobileNumber }) => await login.loginWithMobileNumberAsync(mobileNumber),
    createEmote: async (_, { name, uri }, { pubsub }) => await emotes.writeEmoteAsync(name, uri),
    signup: async (_, { username, mobileNumber }) =>
      await signup.signupUserAsync(username, mobileNumber),
    writePushToken: async (_, { userId, token }) => await push.writeTokenAsync(userId, token),
    likePost: async (_, { userId, postId }, { pubsub }) => {
      const parentPost = await post.getPostAsync(postId);

      if (userId !== parentPost.userId) {
        await push.sendNotificationAsync(
          [parentPost.userId],
          `@${userId.split(':')[1]} just liked your post!`,
          postId
        );
      }

      const like = await reaction.likeAsync(userId, postId);

      pubsub.publish(`reactedTo-${postId}`, { reactedTo: like });

      return like;
    },
    unLikePost: async (_, { userId, reactionId }, { pubsub }) => {
      await db.queryAsync('DELETE FROM notification WHERE body = ?', [
        `@${userId.split(':')[1]} just liked your post!`,
      ]);

      const unlike = await reaction.unLikeAsync(userId, reactionId);

      pubsub.publish(`reactedTo-${unlike.postId}`, { reactedTo: unlike });

      return unlike;
    },
    clearNotifications: async (_, { userId }, { pubsub }) => {
      try {
        await db.queryAsync('DELETE FROM notification WHERE userId = ?', [userId]);
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  Subscription: {
    postCreated: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('postCreated'),
    },
    postDeleted: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('postDeleted'),
    },
    replyAdded: {
      subscribe: (parent, { postId }, { pubsub }) => pubsub.asyncIterator(`replyAdded-${postId}`),
    },
    reactedTo: {
      subscribe: (parent, { postId }, { pubsub }) => pubsub.asyncIterator(`reactedTo-${postId}`),
    },
  },
};
