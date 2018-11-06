import _ from 'lodash';

export const DEFAULT_DECISION_TREE_VERSION = '1';

export const IN_BROWSER = typeof window !== 'undefined';

export const AGENT_ID_MAX_LENGTH = 36;
export const AGENT_ID_ALLOWED_REGEXP = /^([a-z0-9_-]){1,36}$/i;

export const TYPES = {
  continuous: 'continuous',
  enum: 'enum',
  timezone: 'timezone',
  time_of_day: 'time_of_day',
  day_of_week: 'day_of_week',
  day_of_month: 'day_of_month',
  month_of_year: 'month_of_year'
};

export const TYPE_ANY = 'any';

export const GENERATED_TIME_TYPES = [
  TYPES.time_of_day,
  TYPES.day_of_week,
  TYPES.day_of_month,
  TYPES.month_of_year
];

export const OPERATORS = {
  IS: 'is',
  IN: '[in[',
  GTE: '>=',
  LT: '<'
};

export const deprecation = _.memoize(((oldFunction, newFunction) =>
  console.warn(`DEPRECATION WARNING: the '${oldFunction}' function of the craft ai client is deprecated. It will be removed in the future, '${newFunction}' should be used instead.`)
));
