import _ from 'lodash';
import Time from './time';
import { OPERATORS, TYPE_ANY, TYPES } from './constants';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

const PROPERTY_FORMATTER = {
  [TYPE_ANY]: (value) => value,
  [TYPES.continuous]: (number) =>
    number > 0.01 ? `${Math.round(number * 100) / 100}` :
      number.toExponential(2)
  ,
  [TYPES.time_of_day]: (time) => {
    const _time = time instanceof Time ? time.time_of_day : time;
    const hours = Math.floor(_time);
    const hoursStr = _.padStart(hours, 2, '0');
    const decMinutes = Math.round((_time - hours) * 60 * 100) / 100;
    const minutes = Math.floor(decMinutes);
    const minutesStr = _.padStart(minutes, 2, '0');
    const seconds = Math.round((decMinutes - minutes) * 60);
    const secondsStr = _.padStart(seconds, 2, '0');

    if (seconds > 0) {
      return `${hoursStr}:${minutesStr}:${secondsStr}`;
    }
    else {
      return `${hoursStr}:${minutesStr}`;
    }
  },
  [TYPES.day_of_week]: (day) => {
    const _day = day instanceof Time ? day.day_of_week : day;
    return DAYS[_day];
  },
  [TYPES.day_of_month]: (day) => {
    const _day = day instanceof Time ? day.day_of_month : day;
    return _.padStart(_day, 2, '0');
  },
  // Months are in [1; 12] thus -1 to be index month name in [0; 11]
  [TYPES.month_of_year]: (month) => {
    const _month = month instanceof Time ? month.month_of_year : month;
    return MONTH[_month - 1];
  }
};

export function formatProperty(type, value = undefined) {
  const formatter = PROPERTY_FORMATTER[type] || PROPERTY_FORMATTER[TYPE_ANY];
  const extendedFormatter = (value) => {
    // A `null` value corresponds to a null/MVs branch
    if (_.isNull(value)) {
      return 'null';
    }
    // The empty object `{}` corresponds to an optional branch
    else if (_.isPlainObject(value) && _.isEmpty(value)) {
      return 'N/A';
    }
    return formatter(value);
  };
  if (!_.isUndefined(value)) {
    return extendedFormatter(value);
  }
  return extendedFormatter;
}

const FORMATTER_FROM_DECISION_RULE = {
  [OPERATORS.IS]: {
    [TYPE_ANY]: ({ property, operand, operandFormatter }) => {
      if (property) {
        return `'${property}' is ${operandFormatter(operand)}`;
      }
      return `is ${operandFormatter(operand)}`;
    }
  },
  [OPERATORS.IN]: {
    [TYPE_ANY]: ({ property, operand, operandFormatter }) => {
      if (property) {
        return `'${property}' in [${operandFormatter(
          operand[0]
        )}, ${operandFormatter(operand[1])}[`;
      }
      return `[${operandFormatter(operand[0])}, ${operandFormatter(
        operand[1]
      )}[`;
    },
    [TYPES.day_of_week]: ({ property, operand, operandFormatter }) => {
      const day_from = Math.floor(operand[0]);
      const day_to = Math.floor(operand[1]);
      // If there is only one day in the interval
      if (day_to - day_from == 1 || (day_from == 6 && day_to == 0)) {
        if (property) {
          return `'${property}' is ${operandFormatter(day_from)}`;
        }
        return operandFormatter(day_from);
      }
      else {
        if (property) {
          return `'${property}' from ${operandFormatter(
            day_from
          )} to ${operandFormatter((7 + day_to - 1) % 7)}`;
        }
        return `${operandFormatter(day_from)} to ${operandFormatter(
          (7 + day_to - 1) % 7
        )}`;
      }
    },
    [TYPES.month_of_year]: ({ property, operand, operandFormatter }) => {
      const month_from = Math.floor(operand[0]);
      const month_to = Math.floor(operand[1]);
      if (month_to - month_from == 1 || (month_from == 12 && month_to == 1)) {
        // One month in the interval
        if (property) {
          return `'${property}' is ${operandFormatter(month_from)}`;
        }
        return operandFormatter(month_from);
      }
      else if (month_to == 1) {
        // (Excluded) upper bound is january
        if (property) {
          return `'${property}' from ${operandFormatter(
            month_from
          )} to ${operandFormatter(12)}`;
        }
        return `${operandFormatter(month_from)} to ${operandFormatter(12)}`;
      }
      else {
        if (property) {
          return `'${property}' from ${operandFormatter(
            month_from
          )} to ${operandFormatter(month_to - 1)}`;
        }
        return `${operandFormatter(month_from)} to ${operandFormatter(
          month_to - 1
        )}`;
      }
    }
  },
  [OPERATORS.GTE]: {
    [TYPE_ANY]: ({ property, operand, operandFormatter }) => {
      if (property) {
        return `'${property}' >= ${operandFormatter(operand)}`;
      }
      return `>= ${operandFormatter(operand)}`;
    }
  },
  [OPERATORS.LT]: {
    [TYPE_ANY]: ({ property, operand, operandFormatter }) => {
      if (property) {
        return `'${property}' < ${operandFormatter(operand)}`;
      }
      return `< ${operandFormatter(operand)}`;
    }
  }
};

export function formatDecisionRules(decisionRules) {
  return decisionRules
    .map(({ property, type, operand, operator }) => {
      const operatorFormatters = FORMATTER_FROM_DECISION_RULE[operator];
      if (!operatorFormatters) {
        throw new Error(
          `Unable to format the given decision rule: unknown operator '${operator}'.`
        );
      }
      const formatter =
        operatorFormatters[type] || operatorFormatters[TYPE_ANY];
      const operandFormatter = formatProperty(type || TYPE_ANY);
      return formatter({ property, type, operator, operandFormatter, operand });
    })
    .join(' and ');
}
