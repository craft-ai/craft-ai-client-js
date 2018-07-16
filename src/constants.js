import _ from 'lodash';

export const IN_BROWSER = typeof window !== 'undefined';

export const AGENT_ID_MAX_LENGTH = 36;
export const AGENT_ID_ALLOWED_REGEXP = /^([a-z0-9_-]){1,36}$/i;

export const deprecation = _.memoize(((oldFunction, newFunction) =>
  console.warn(`DEPRECATION WARNING: the \'${oldFunction}\' function of the craft ai client is deprecated. It will be removed in the future, \'${newFunction}\' should be used instead.`)
));
