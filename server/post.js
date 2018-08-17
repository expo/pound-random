let data = require('./data');
let db = require('./db');
let compactUuid = require('./compactUuid');
let links = require('./links');
let clientError = require('./clientError');

function makePostId() {
  return 'post:' + compactUuid.makeUuid();
}

async function newPostAsync(userId, content, replyTo, createdTime) {
  let postId = makePostId();

  let results = await data.writeNewObjectAsync(
    {
      postId,
      content,
      userId,
      replyTo,
      createdTime,
    },
    'post'
  );

  return postId;
}

async function getPostAsync(postId) {
  const o = await data.getObjectAsync(postId, 'post');
  if (!o) return null;
  return { ...o, content: JSON.parse(o.content) };
}

async function deletePostAsync(postId, userId) {
  const post = await getPostAsync(postId);

  if (post.userId !== userId) {
    throw clientError('INCORRECT_USER', 'Only the creator of the post may delete it');
  }

  for (const p of await getRepliesToPost(postId)) {
    await db.queryAsync('DELETE FROM post WHERE postId = ?', [p.postId]);
    await db.queryAsync('DELETE FROM notification WHERE postId = ?', [p.postId]);
  }

  await db.queryAsync('DELETE FROM notification WHERE postId = ?', [postId]);
  return await db.queryAsync('DELETE FROM post WHERE postId = ?', [postId]);
}

async function getRepliesToPost(postId) {
  let results = await db.queryAsync('SELECT * FROM post WHERE replyTo = ? ORDER BY ts ASC', [
    postId,
  ]);

  return results.map((o) => ({ ...o, content: JSON.parse(o.content) }));
}

async function getUsersPosts(userId) {
  let results = await db.queryAsync('SELECT * FROM post WHERE userId = ? ORDER BY ts DESC', [
    userId,
  ]);

  return results
    .filter((p) => {
      return p.replyTo === null;
    })
    .map((o) => ({ ...o, content: JSON.parse(o.content) }));
}

async function multigetPostsAsync(postIdList) {
  return await data.multigetObjectsAsync(postIdList, 'post', { column: 'postId' });
}

async function getLatestPostsAsync(limit = 20) {
  let results = await db.queryAsync('SELECT * FROM post ORDER BY ts DESC');
  let posts = [];
  for (let p of results) {
    posts.push({ ...p });
  }
  return posts;
}

async function buildFeedAsync() {
  let latestPosts = (await getLatestPostsAsync())
    .filter((p) => {
      return p.replyTo === null;
    })
    .map((o) => ({ ...o, content: JSON.parse(o.content) }));

  return latestPosts;
}

module.exports = {
  buildFeedAsync,
  getPostAsync,
  multigetPostsAsync,
  newPostAsync,
  deletePostAsync,
  getLatestPostsAsync,
  getRepliesToPost,
  makePostId,
  getUsersPosts,
};
