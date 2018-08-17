const typeDefs = `
scalar Json 
scalar Datetime 

type User {
  userId: ID! @unique
  normalizedUsername: String @unique
  displayUsername: String @unique
  email: String
  emailConfirmed: Boolean
  mobileNumber: String
  mobileNumberConfirmed: Boolean
  hashedPassword: String
  createdTime: Datetime
  updatedTime: Datetime
}

type Contact {
  contactId: ID!
  userId: ID
  contactType: String
  displayContact: String
  normalizedContact: String
  confirmationCode: String
  confirmationSentTime: Datetime
  confirmed: Boolean
  isPrimary: Boolean
  active: Boolean
  removed: Boolean
  commandeered: Boolean
  bouncing: Boolean
  createdTime: Datetime
  updatedTime: Datetime
}

type LoginCode {
  userId: ID!
  loginCode: String
  sentTime: Datetime
  createdTime: Datetime
  updatedTime: Datetime
}

type Post {
  postId: ID @unique
  content: Json
  userId: ID
  replyTo: String
  createdTime: Datetime
  updatedTime: Datetime
  ts: String
}

type Session {
  token: ID
  userId: ID
}

type LinkMetadata {
  icon: String
  title: String
  description: String
  image: String
}

type LinkInfo {
  url: String
  metadata: LinkMetadata
}

type SignupResult {
  userId: String
  normalizedMobileNumber: String
  normalizedUsername: String
}

type Reaction {
  postId: ID
  reactionId: ID
  userId: ID
  vote: Int
}

type MercuryResponse {
  title: String
  content: String
  date_published: Datetime
  lead_image_url: String
  dek: String
  url: String
  domain: String
  excerpt: String
  word_count: Int
  direction: String
  total_pages: Int
  rendered_pages: Int
  next_page_url: String
}

type PushToken {
  userId: String
  token: String
}

type Notification {
  postId: ID
  userId: ID
  body: String
  createdTime: Datetime
}

type Emote {
  name: ID
  uri: String
}

type Tweet {
  created_at: String
  id_str: ID
  text: String
  user: Json
  truncated: Boolean
  place: Json
  full_text: String
  entities: Json
  extended_entities: Json
  extended_tweet: Json
}

type Query {
  feed: [Post!]!
  post(id: ID): Post
  replies(to: ID): [Post!]!
  getInfoFor(link: String): LinkInfo
  doesUsernameExist(username: String): Boolean
  parseWeb(url: String): MercuryResponse
  update: Boolean
  getPushToken(userId: String): PushToken
  reactions(postId: ID!): [Reaction!]!
  likes(userId: ID!): [Reaction!]!
  notifications(userId: ID!): [Notification!]!
  emotes: [Emote!]!
  postsFrom(userId: ID!): [Post!]!
  tweet(id: ID!): Tweet
  users: [String!]!
}

type Mutation {
  deletePost(postId: ID!, userId: ID!): Post
  createPost(replyTo: ID, userId: ID!, content: Json!, createdTime: String): Post
  createReply(replyTo: ID, userId: ID!, content: Json!, createdTime: String): Post
  login(mobileNumber: String): Boolean
  createEmote(name: ID!, uri: String!): Emote
  signup(username: String!, mobileNumber: String!): SignupResult
  createSession(mobileNumber: String, loginCode: String): Session
  writePushToken(userId: String, token: String): PushToken
  likePost(postId: ID!, userId: ID!): Reaction
  unLikePost(reactionId: ID!, userId: ID!): Reaction
  clearNotifications(userId: ID!): Boolean
}

type Subscription {
  postCreated: Post
  postDeleted: Post
  replyAdded(postId: ID!): Post
  reactedTo(postId: ID!): Reaction
}
`;

module.exports = typeDefs;
