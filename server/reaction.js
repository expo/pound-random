let db = require('./db');
let data = require('./data');
let compactUuid = require('./compactUuid');
let _ = require('lodash');
function makeReactionId() {
  return 'reaction:' + compactUuid.makeUuid();
}

async function getReactionsToPost(postId) {
  let results = await db.queryAsync('SELECT * FROM reaction WHERE postId = ?', [postId]);

  return results;
}
async function getUsersLikes(userId) {
  let results = await db.queryAsync('SELECT * FROM reaction WHERE userId = ?', [userId]);

  return _.uniqBy(results.filter((r) => r.vote === 1), 'postId');
}

async function getReactionAsync(reactionId) {
  return await data.getObjectAsync(reactionId, 'reaction');
}

async function likeAsync(userId, postId) {
  const reactionId = makeReactionId();

  const result = await data.writeNewObjectAsync(
    { userId, postId, vote: 1, reactionId },
    'reaction'
  );

  return result;
}

async function unLikeAsync(userId, reactionId) {
  const reaction = await getReactionAsync(reactionId);

  if (reaction.userId !== userId) {
    throw clientError('INCORRECT_USER', 'Only the creator of the like may unlike a post');
  }

  const result = await db.queryAsync('DELETE FROM reaction WHERE reactionId = ?', [reactionId]);

  return { ...reaction, vote: 0 };
}

module.exports = {
  getReactionsToPost,
  likeAsync,
  unLikeAsync,
  getUsersLikes,
};
