let typedError = require('./typedError');

function clientError(code, message, props) {
  let e = typedError('CLIENT_ERROR', message);
  e.props = props;
  e.code = code;
  return e;
}

function isClientError(err) {
  return (err && err.type === 'CLIENT_ERROR');
}

clientError.isClientError = isClientError;

module.exports = clientError;

