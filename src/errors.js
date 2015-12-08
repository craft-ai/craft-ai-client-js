import inherits from 'inherits';
import _ from 'lodash';

function CraftAiError(message, extraProperties) {
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack || 'Cannot get a stacktrace, browser is too old';
  }

  this.name = this.constructor.name;
  this.message = message || 'Unknown error';

  if (extraProperties) {
    _.forEach(extraProperties, (value, key) => {
      this[key] = value;
    });
  }
}

inherits(CraftAiError, Error);

function createCustomError(name, message) {
  function CraftAiCustomError() {
    var args = Array.prototype.slice.call(arguments, 0);

    // custom message not set, use default
    if (typeof args[0] !== 'string') {
      args.unshift(message);
    }

    CraftAiError.apply(this, args);
    this.name = name;
  }

  inherits(CraftAiCustomError, CraftAiError);

  return CraftAiCustomError;
}

let CraftAiUnknownError = createCustomError(
  'CraftAiUnknownError',
  'Unknown error occured'
);

let CraftAiNetworkError = createCustomError(
  'CraftAiNetworkError',
  'Network issue, see err.more for details'
);

let CraftAiCredentialsError = createCustomError(
  'CraftAiCredentialsError',
  'Credentials error, make sure the given appId/appSecret are valid'
);

export {
  CraftAiCredentialsError,
  CraftAiError,
  CraftAiNetworkError,
  CraftAiUnknownError
};
