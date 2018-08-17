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
  content JSON,
  userId VARCHAR(255),
  replyTo VARCHAR(255),
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdTime DATETIME,
  updatedTime DATETIME
);


CREATE TABLE contact (
  contactId VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255),
  contactType VARCHAR(24),
  displayContact VARCHAR(255),
  normalizedContact VARCHAR(255),
  confirmationCode VARCHAR(100),
  confirmationSentTime DATETIME,
  confirmed INT NOT NULL DEFAULT 0,
  isPrimary INT NOT NULL DEFAULT 0,
  active INT NOT NULL DEFAULT 0,
  removed INT NOT NULL DEFAULT 0,
  commandeered INT NOT NULL DEFAULT 0,
  bouncing INT NOT NULL DEFAULT 0,
  createdTime DATETIME,
  updatedTime DATETIME,
  INDEX idx_contact_userId (userId),
  INDEX idx_contact_normalizedContact (normalizedContact),
  INDEX idx_contact_confirmationCode (confirmationCode)
);

CREATE TABLE loginCode (
  userId VARCHAR(255) PRIMARY KEY,
  loginCode VARCHAR(100),
  sentTime DATETIME,
  createdTime DATETIME,
  updatedTime DATETIME,
  INDEX idx_loginCode_userId (userId),
  INDEX idx_loginCode_loginCode (loginCode)
);

CREATE TABLE pushNotificationToken (
  userId VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255),
  createdTime DATETIME,
  updatedTime DATETIME
);

CREATE TABLE reaction (
  reactionId VARCHAR(255) PRIMARY KEY,
  postId VARCHAR(255),
  vote INT NOT NULL DEFAULT 0,
  userId VARCHAR(255),
  createdTime DATETIME,
  updatedTime DATETIME
);

CREATE TABLE notification (
  userId VARCHAR(255),
  postId VARCHAR(255) PRIMARY KEY,
  body TEXT,
  createdTime DATETIME,
  updatedTime DATETIME
);

CREATE TABLE emote (
  name VARCHAR(255) PRIMARY KEY,
  uri TEXT,
  createdTime DATETIME,
  updatedTime DATETIME
);
