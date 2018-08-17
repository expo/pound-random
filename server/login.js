let timeconstants = require('timeconstants');

let clientError = require('./clientError');
let compactUuid = require('./compactUuid');
let contact = require('./contact');
let data = require('./data');
let session = require('./session');
let sms = require('./sms');

async function loginWithMobileNumberAsync(mobileNumber) {
  // Will throw a `clientError` if is an invalid #
  let normalizedMobileNumber = contact.normalizeMobileNumber(mobileNumber);

  let userId = await contact.getUserIdForNormalizedMobileNumberAsync(normalizedMobileNumber);
  if (!userId) {
    throw clientError('INCORRECT_PHONE_NUMBER', 'No user with that phone number');
  }

  let code = await makeNewConfirmationCodeAsync(userId);
  await sendConfirmationCodeToMobileNumberAsync(normalizedMobileNumber, code);

  return true;
}

async function checkCodeForMobileNumberAsync(mobileNumber, code) {
  let normalizedMobileNumber = contact.normalizeMobileNumber(mobileNumber);

  let userId = await contact.getUserIdForNormalizedMobileNumberAsync(normalizedMobileNumber);
  if (!userId) {
    throw clientError('INCORRECT_CODE', 'That code is incorrect');
  }

  // Will throw a clientError if the code isn't correct
  await checkCodeAsync(code, userId);

  let token = await session.newSessionAsync(userId);
  return {
    userId,
    token,
  };
}

// CODE STUFF
async function makeNewConfirmationCodeAsync(userId) {
  let code = contact.makeConfirmationCode();
  let now = new Date();

  // Wait for this to write successfully before sending the text; we could do them in parallel
  // but we don't want to send a message to the user if we fail to write the code to the database
  await data.writeNewObjectAsync(
    {
      userId,
      loginCode: code,
      sentTime: now,
    },
    'loginCode',
    { replace: true }
  );

  return code;
}

async function sendConfirmationCodeToMobileNumberAsync(mobileNumber, loginCode) {
  await sms.sendMessageAsync(mobileNumber, 'Your #random login code is: ' + loginCode);
}

async function checkCodeAsync(code, userId) {
  let codeObj = await data.getObjectAsync(userId, 'loginCode', { column: 'userId' });
  if (codeObj) {
    if (codeObj.loginCode === code) {
      // Check to make sure its not too old
      let CONFIRMATION_TIMEOUT_MS = 10 * timeconstants.minute;
      if (codeObj.sentTime.getTime() + CONFIRMATION_TIMEOUT_MS < Date.now()) {
        throw clientError('CODE_EXPIRED', 'That confirmation code has expired');
      }
      return true;
    }
  }
  throw clientError('INCORRECT_CODE', 'That code is incorrect');
}

module.exports = {
  loginWithMobileNumberAsync,
  makeNewConfirmationCodeAsync,
  sendConfirmationCodeToMobileNumberAsync,
  checkCodeAsync,
  checkCodeForMobileNumberAsync,
};
