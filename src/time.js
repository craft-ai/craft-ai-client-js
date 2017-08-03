import _ from 'lodash';
import moment from 'moment';
import { CraftAiTimeError } from './errors';

// From 'moment/src/lib/parse/regex.js'
const OFFSET_REGEX = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z

function tzFromOffset(offset) {
  if (_.isInteger(offset)) {
    const sign = offset >= 0 ? '+' : '-';
    const abs = Math.abs(offset);
    return `${sign}${_.padStart(Math.floor(abs / 60), 2, '0')}:${_.padStart(abs % 60, 2, '0')}`;
  }
  else {
    return offset;
  }
}

export default function Time(t = undefined, tz = undefined) {
  // Make sure it works with or without new.
  if (!(this instanceof Time)) {
    return new Time(t, tz);
  }

  let m;
  if (t instanceof Time) {
    // t is an instance of Time
    m = moment.unix(t.timestamp);
    m.utcOffset(t.timezone);
  }
  else if (t instanceof moment) {
    // t is an instance of moment
    m = t;
  }
  else if (_.isNumber(t)) {
    // t is a posix timestamp
    // it might be a float as retrieved by Date.now() / 1000
    m = moment.unix(t);
  }
  else if (_.isString(t) && t.match(OFFSET_REGEX)) {
    // String with a explicit offset
    m = moment.parseZone(t);
  }
  else if (_.isUndefined(t)) {
    m = moment();
  }
  else {
    // Any other format, should be parseable by moment
    m = moment(new Date(t));
    if (!m.isValid()) {
      throw new CraftAiTimeError(`Time error, given "${t}" is invalid.`);
    }
  }

  if (tz) {
    // tz formats should be parseable by moment
    m.utcOffset(tz);
  }

  const minuteOffset =  m.utcOffset();

  return _.extend(this, {
    timestamp: m.unix(),
    timezone: tzFromOffset(minuteOffset),
    time_of_day: m.hour() + m.minute() / 60 + m.second() / 3600,
    day_of_month: m.date(),          // we want day to be in [1;31]
    month_of_year: m.month() + 1,    // we want months to be in [1;12]
    day_of_week: m.isoWeekday() - 1, // we want week day to be in [0;6]
    utc: m.toISOString()
  });
}
