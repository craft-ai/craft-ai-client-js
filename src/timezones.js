const TIMEZONE_REGEX = /^([+-](2[0-3]|[01][0-9])(:?[0-5][0-9])?|Z)$/; // +/-00:00 -/+00 Z +/-0000

export const timezones = {
  'UTC': '+00:00',
  'GMT': '+00:00',
  'BST': '+01:00',
  'IST': '+01:00',
  'WET': '+00:00',
  'WEST': '+01:00',
  'CET': '+01:00',
  'CEST': '+02:00',
  'EET': '+02:00',
  'EEST': '+03:00',
  'MSK': '+03:00',
  'MSD': '+04:00',
  'AST': '-04:00',
  'ADT': '-03:00',
  'EST': '-05:00',
  'EDT': '-04:00',
  'CST': '-06:00',
  'CDT': '-05:00',
  'MST': '-07:00',
  'MDT': '-06:00',
  'PST': '-08:00',
  'PDT': '-07:00',
  'HST': '-10:00',
  'AKST': '-09:00',
  'AKDT': '-08:00',
  'AEST': '+10:00',
  'AEDT': '+11:00',
  'ACST': '+09:30',
  'ACDT': '+10:30',
  'AWST': '+08:00'
};

const isTimezone = (value) => {
  const resultRegexp = TIMEZONE_REGEX.test(value);
  const resultAbbreviations = timezones[value] != undefined;
  return resultRegexp || resultAbbreviations;
};

export default isTimezone;
