let phone = require('phone');
let timeconstants = require('timeconstants');
// Lazy require validator since its a little heavy and only used in this one random place
// let validator = require('validator');

let compactUuid = require('./compactUuid');
let clientError = require('./clientError');
let db = require('./db');
let data = require('./data');
let sms = require('./sms');

// UTIL

function normalizeMobileNumber(displayMobileNumber) {
  let [normalizedMobileNumber, country] = phone(displayMobileNumber);
  if (!normalizedMobileNumber) {
    throw clientError('INVALID_MOBILE_NUMBER', 'Invalid mobile number: ' + displayMobileNumber, {
      number: displayMobileNumber,
    });
  }
  return normalizedMobileNumber;
}

function normalizeEmail(displayEmail) {
  let validator = require('validator');
  if (!validator.isEmail(displayEmail)) {
    throw clientError('INVALID_EMAIL', 'Invalid e-mail address: ' + displayEmail, {
      email: displayEmail,
    });
  }

  let normalizedEmail = validator.normalizeEmail(displayEmail, {
    gmail_remove_subaddress: false, // Allow gmail subaddresses for testing, throwaways, etc.
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
    gmail_convert_googlemaildotcom: false, // I think this would be confusing to people
  });

  return normalizedEmail;
}

// MODEL
async function getUserIdForNormalizedMobileNumberAsync(normalizedMobileNumber) {
  let result = await db.queryAsync(
    'SELECT userId FROM contact WHERE contactType = ? AND normalizedContact = ? ORDER BY confirmed desc, updatedTime desc',
    ['mobile', normalizedMobileNumber]
  );
  if (result.length > 0) {
    if (result.length > 1) {
      console.warn('More than one user with the same phone number: ' + normalizedMobileNumber);
    }
    return result[0].userId;
  }
}

async function getContactsForUserIdAsync(userId, contactType) {
  let params = [userId];
  let q = 'SELECT * FROM contact WHERE userId = ? AND';
  if (contactType) {
    q += ' contactType = ? AND';
    params.push(contactType);
  }
  q += ' NOT removed ORDER BY isPrimary DESC';
  let results = await db.queryAsync(q, params);
  return data.objectsListFromResults(results);
}

function makeContactIdForMobileNumber(userId, normalizedMobileNumber) {
  return 'contact:' + userId + '/' + normalizedMobileNumber + '/' + compactUuid.makeUuid(8);
}

async function getMobileNumberForUserIdAsync(userId) {
  let contacts = await getContactsForUserIdAsync(userId, 'mobile');
  let contact = contacts[0];
  if (contact) {
    return contact.normalizedContact;
  }
}

async function createNewMobileNumberAsync(userId, displayMobileNumber) {
  let normalizedMobileNumber = normalizeMobileNumber(displayMobileNumber);
  let contactId = makeContactIdForMobileNumber(userId, normalizedMobileNumber);
  let contact = {
    contactId,
    userId,
    displayContact: displayMobileNumber,
    normalizedContact: normalizedMobileNumber,
    contactType: 'mobile',
  };
  await data.writeNewObjectAsync(contact, 'contact');
  return contact;
}

async function writeConfirmationDataForContact(contactId, confirmationCode, confirmationSentTime) {
  await updateContactAsync(contactId, {
    confirmationCode,
    confirmationSentTime,
  });
}

async function updateContactAsync(contactId, update) {
  return await data.updateObjectAsync(contactId, 'contact', update);
}

// CONTROLLER

function makeConfirmationCode() {
  let CONFIRMATION_CODE_LENGTH = 6;
  let code = '';
  for (let i = 0; i < CONFIRMATION_CODE_LENGTH; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

async function sendConfirmationForContactAsync(contact) {
  let code = makeConfirmationCode();
  let smsP = sms.sendMessageAsync({
    To: contact.normalizedContact,
    Body: 'Your #random confirmation code is ' + code,
  });
  let writeP = updateContactAsync(contact.contactId, {
    confirmationCode: code,
    confirmationSentTime: new Date(),
  });
  await Promise.all([smsP, writeP]);
  return code;
}

async function verifyConfirmationCodeForContactAsync(contact, code) {
  if (contact.confirmationCode !== code) {
    throw clientError('WRONG_CONFIRMATION_CODE', "The confirmation code wasn't correct", {
      codeYouEntered: code,
    });
  }

  let CONFIRMATION_TIMEOUT_MS = 1 * timeconstants.hour;
  if (contact.confirmationSentTime.getTime() + CONFIRMATION_TIMEOUT_MS < Date.now()) {
    throw clientError(
      'EXPIRED_CONFIRMATION_CODE',
      'You must enter the confirmation code within an hour'
    );
  }

  // Form here on, we can assume the code is good

  await updateContactAsync(contact.contactId, {
    confirmed: true,
  });

  return true;
}

module.exports = {
  normalizeMobileNumber,
  normalizeEmail,
  getContactsForUserIdAsync,
  createNewMobileNumberAsync,
  makeContactIdForMobileNumber,
  writeConfirmationDataForContact,
  makeConfirmationCode,
  sendConfirmationForContactAsync,
  verifyConfirmationCodeForContactAsync,
  getMobileNumberForUserIdAsync,
  getUserIdForNormalizedMobileNumberAsync,
};
