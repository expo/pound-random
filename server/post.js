let db = require("./db");
let compactUuid = require("./compactUuid");

function makePostId() {
  return "post:" + compactUuid.makeUuid();
}

async function newPostAsync(userId, content, url, replyTo) {
  let postId = makePostId();
  let postTime = new Date();
  let results = await db.queryAsync("INSERT INTO post (postId, content, url, userId, replyTo, createdTime, updatedTime) VALUES (?, ?, ?, ?, ?, ?, ?);", [postId, content, url, userId, replyTo, postTime, postTime]);
  return postId;
}

async function getPostAsync(postId) {
  return await data.getObjectAsync(postId, 'post');
}

async function deletePostAsync(postId) {
  await db.queryAsync("DELETE FROM post WHERE post_id = ?", [postId]);
}

async function getLatestPostsAsync() {
  let results = await db.queryAsync("SELECT * FROM post ORDER BY created_at DESC LIMIT 20");
  let posts = [];
  for (let i = 0; i < results.length; i++) {
    posts.push({ ...results[i] });
  }
  return posts;
}

module.exports = {
  getPostAsync,
  newPostAsync,
  deletePostAsync,
  getLatestPostsAsync,
  makePostId,
};

