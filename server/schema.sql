CREATE TABLE user (
  userId VARCHAR(255) PRIMARY KEY,
  normalizedUsername VARCHAR(255) UNIQUE,
  displayUsername VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  emailConfirmed INT,
  mobileNumber VARCHAR(255),
  mobileNumberConfirmed INT,
  hashedPassword VARCHAR(255),
  createdTime DATETIME,
  updatedTime DATETIME
);

CREATE TABLE session (
  token VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255),
  expires DATETIME,
  createdTime DATETIME,
  updatedTime DATETIME
);

CREATE TABLE post (
  postId VARCHAR(255) PRIMARY KEY,
  content TEXT,
  url VARCHAR(512),
  userId VARCHAR(255),
  replyTo VARCHAR(255),
  createdTime DATETIME,
  updatedTime DATETIME
);


