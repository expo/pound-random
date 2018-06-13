let data = require("./data");
let db = require("./db");
let compactUuid = require("./compactUuid");

function makePostId() {
  return "post:" + compactUuid.makeUuid();
}

async function newPostAsync(userId, content, url, replyTo) {
  let postId = makePostId();
  let results = await data.writeNewObjectAsync({
    postId,
    content,
    url,
    userId,
    replyTo,
  }, "post");
  // let results = await db.queryAsync("INSERT INTO post (postId, content, url, userId, replyTo, createdTime, updatedTime) VALUES (?, ?, ?, ?, ?, ?, ?);", [postId, content, url, userId, replyTo, postTime, postTime]);
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
  let results = await db.queryAsync("SELECT * FROM post ORDER BY createdTime DESC LIMIT 20");
  let posts = [];
  for (let p of results) {
    posts.push({ ...p });
  }
  return posts;
}

async function annotatePostsAsync(postList) {
  let a = [];
  for (let p of postList) {
    a.push((async () => {
      let extra = await getInfoAboutPostAsync(p);
      return {
        ...p,
        extra,
      };
    })());
  }
  return await Promise.all(a);
}

// Should this be on the server?
async function getInfoAboutPostAsync(p) {
  let content = p.content;

  let headline = content.split("\n", 1)[0];
  // TODO: Make this smarter
  let MAX_HEADLINE_LENGTH = 255;
  if (headline.length > MAX_HEADLINE_LENGTH) {
    headline = headline.substr(0, MAX_HEADLINE_LENGTH);
  }

  let rest = content.substr(headline.length);

  rest = rest.trim();
  headline = headline.trim();

  return {
    headline,
    rest,
  };

}

module.exports = {
  annotatePostsAsync,
  getPostAsync,
  multigetPostsAsync,
  newPostAsync,
  deletePostAsync,
  getLatestPostsAsync,
  makePostId,
};

