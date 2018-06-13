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

async function multigetPostsAsync(postIdList) {
  return await data.multigetObjectsAsync(postIdList, "post", { column: 'postId' });
}

async function getLatestPostsAsync() {
  let results = await db.queryAsync("SELECT * FROM post ORDER BY created_at DESC LIMIT 20");
  let posts = [];
  for (let p of results) {
    posts.push({ ...p });
  }
  return posts;
}

module.exports = {
  getPostAsync,
  multigetPostsAsync,
  newPostAsync,
  deletePostAsync,
  getLatestPostsAsync,
  makePostId,
};

