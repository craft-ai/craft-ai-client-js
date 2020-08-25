import * as _ from './lodash';

class CraftAiError extends Error {
  constructor(message, extraProperties, defaultMessage = 'Unknown error') {
    if (!_.isString(message)) {
      extraProperties = message;
      message = _.get(extraProperties, 'message', defaultMessage);
    }

    super(message);

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
    else {
      this.stack = (new Error()).stack || 'Cannot get a stacktrace, browser is too old';
    }

    this.name = this.constructor.name;
    this.message = message;

    if (extraProperties) {
      Object.entries(extraProperties)
        .forEach(([key, value]) => {
          this[key] = value;
        });
    }
  }
}

class CraftAiUnknownError extends CraftAiError {
  constructor(message, extraProperties) {
    super(message, extraProperties, 'Unknown error occured');
    this.name = this.constructor.name;
  }
}

class CraftAiNetworkError extends CraftAiError {
  constructor(message, extraProperties) {
    super(message, extraProperties, 'Network issue, see err.more for details');
    this.name = this.constructor.name;
  }
}

class CraftAiCredentialsError extends CraftAiError {
  constructor(message, extraProperties) {
    super(message, extraProperties, 'Credentials error, make sure the given token is valid');
    this.name = this.constructor.name;
  }
}

class CraftAiInternalError extends CraftAiError {
  constructor(message, extraProperties) {
    super(message, extraProperties, 'Internal Error, see err.more for details');
    this.name = this.constructor.name;
  }
}

class CraftAiBadRequestError extends CraftAiError {
  constructor(message, extraProperties) {
    super(message, extraProperties, 'Bad Request, see err.more for details');
    this.name = this.constructor.name;
  }
}

class CraftAiDecisionError extends CraftAiError {
  constructor(message, extraProperties) {
    super(message, extraProperties, 'Error while taking a decision, see err.metadata for details');
    this.name = this.constructor.name;
  }
}

class CraftAiNullDecisionError extends CraftAiError {
  constructor(message, extraProperties) {
    super(message, extraProperties, 'Taken decision is null, see err.metadata for details');
    this.name = this.constructor.name;
  }
}

class CraftAiTimeError extends CraftAiError {
  constructor(message, extraProperties) {
    super(message, extraProperties, 'Time error, see err.more for details');
    this.name = this.constructor.name;
  }
}

class CraftAiLongRequestTimeOutError extends CraftAiError {
  constructor(message, extraProperties) {
    super(message, extraProperties, 'Request timed out because the computation is not finished, please try again');
    this.name = this.constructor.name;
  }
}

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
