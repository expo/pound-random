USERNAME_REGEX = /^[a-zA-Z0-9\.\-_]*$/;
USERNAME_MIN_LENGTH = 2;
USERNAME_MAX_LENGTH = 80;

function validateUsername(rawUsername) {
  return (
    USERNAME_REGEX.test(rawUsername) && 
    rawUsername.length >= USERNAME_MIN_LENGTH &&
    rawUsername.length <= USERNAME_MAX_LENGTH
  );
}

function normalizeUsername(rawUsername) {
  return rawUsername.toLowerCase().replace(".", "").replace("-", "_");
}


module.exports = {
  normalizeUsername,
  validateUsername,
}

