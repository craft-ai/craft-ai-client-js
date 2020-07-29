import Time from './time';
import * as _ from './lodash';

export default function createContext(configuration, ...args) {
  if (_.isUndefined(configuration) || _.isUndefined(configuration.context)) {
    throw new Error('Unable to create context, the given configuration is not valid');
  }

  const inputContext = _.omit(configuration.context, configuration.output);

  return _.reduce(args, (context, arg) => {
    if (arg instanceof Time) {
      const { day_of_month, day_of_week, month_of_year, time_of_day, timezone } = arg;

      return _.mapValues(inputContext, (v, k) => {
        if (v.type === 'day_of_week' && (_.isUndefined(v.is_generated) || v.is_generated)) {
          return day_of_week;
        }
        else if (v.type === 'time_of_day' && (_.isUndefined(v.is_generated) || v.is_generated)) {
          return time_of_day;
        }
        else if (v.type === 'day_of_month' && (_.isUndefined(v.is_generated) || v.is_generated)) {
          return day_of_month;
        }
        else if (v.type === 'month_of_year' && (_.isUndefined(v.is_generated) || v.is_generated)) {
          return month_of_year;
        }
        else if (v.type === 'timezone') {
          return timezone;
        }
        else {
          return context[k];
        }
      });
    }
    else {
      return _.mapValues(inputContext, (v, k) => {
        return _.isUndefined(arg[k]) ? context[k] : arg[k];
      });
    }
  }, _.mapValues(inputContext, () => {
    return undefined;
  }));
}
