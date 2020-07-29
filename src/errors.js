import inherits from 'inherits';
import * as _ from './lodash';

function CraftAiError(message, extraProperties) {
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }
  else {
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
    const args = Array.prototype.slice.call(arguments, 0);

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
  'Credentials error, make sure the given token is valid'
);

let CraftAiInternalError = createCustomError(
  'CraftAiInternalError',
  'Internal Error, see err.more for details'
);

let CraftAiBadRequestError = createCustomError(
  'CraftAiBadRequestError',
  'Bad Request, see err.more for details'
);

let CraftAiDecisionError = createCustomError(
  'CraftAiDecisionError',
  'Error while taking a decision, see err.metadata for details'
);

let CraftAiNullDecisionError = createCustomError(
  'CraftAiNullDecisionError',
  'Taken decision is null, see err.metadata for details'
);

let CraftAiTimeError = createCustomError(
  'CraftAiTimeError',
  'Time error, see err.more for details'
);

let CraftAiLongRequestTimeOutError = createCustomError(
  'CraftAiLongRequestTimeOutError',
  'Request timed out because the computation is not finished, please try again'
);

export {
  CraftAiBadRequestError,
  CraftAiCredentialsError,
  CraftAiDecisionError,
  CraftAiError,
  CraftAiInternalError,
  CraftAiNetworkError,
  CraftAiNullDecisionError,
  CraftAiTimeError,
  CraftAiLongRequestTimeOutError,
  CraftAiUnknownError
};
