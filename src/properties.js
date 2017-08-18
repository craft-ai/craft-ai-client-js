import _ from 'lodash';
import moment from 'moment';

export const TYPES = {
  continuous: 'continuous',
  enum: 'enum',
  timezone: 'timezone',
  time_of_day: 'time_of_day',
  day_of_week: 'day_of_week',
  day_of_month: 'day_of_month',
  month_of_year: 'month_of_year'
};

const TYPE_ANY = 'any';

export const GENERATED_TIME_TYPES = [
  TYPES.time_of_day,
  TYPES.day_of_week,
  TYPES.day_of_month,
  TYPES.month_of_year
];

const DAYS = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun'
];

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
  [TYPES.continuous]: (number) => `${Math.round(number * 100) / 100}`,
  [TYPES.time_of_day]: (time) => {
    if (_.isDate(time)) {
      const momentTime = moment(time);
      if (momentTime.seconds() < 1) {
        return momentTime.format('HH:mm');
      }
      else {
        return momentTime.format('HH:mm:ss');
      }
    }
    else {
      const hours = Math.floor(time);
      const hoursStr = _.padStart(hours, 2, '0');
      const decMinutes = (time - hours) * 60;
      const minutes = Math.floor(decMinutes);
      const minutesStr = _.padStart(minutes, 2, '0');
      const seconds = Math.floor((decMinutes - minutes) * 60);
      const secondsStr = _.padStart(seconds, 2, '0');

      if (seconds > 0) {
        return `${hoursStr}:${minutesStr}:${secondsStr}`;
      }
      else {
        return `${hoursStr}:${minutesStr}`;
      }
    }
  },
  [TYPES.day_of_week]: (day) => {
    if (_.isDate(day)) {
      return DAYS[moment(day).isoWeekday() - 1];
    }
    else {
      return DAYS[day];
    }
  },
  [TYPES.day_of_month]: (day) => {
    if (_.isDate(day)) {
      return moment(day).date();
    }
    else {
      return day;
    }
  },
  // Months are in [1; 12] thus -1 to be index month name in [0; 11]
  [TYPES.month_of_year]: (month) => {
    if (_.isDate(month)) {
      return MONTH[moment(month).month()];
    }
    else {
      return MONTH[month - 1];
    }
  }
};

export function formatProperty(type, value = undefined) {
  const formatter = PROPERTY_FORMATTER[type] || PROPERTY_FORMATTER[TYPE_ANY];
  if (value !== undefined) {
    return formatter(value);
  }
  return formatter;
}

export const OPERATORS = {
  IS: 'is',
  IN: '[in[',
  GTE: '>=',
  LT: '<'
};

const FORMATTER_FROM_DECISION_RULE = {
  [OPERATORS.IS]: {
    [TYPE_ANY]: ({ operand, operandFormatter }) => `is ${operandFormatter(operand)}`
  },
  [OPERATORS.IN]: {
    [TYPE_ANY]: ({ operand, operandFormatter }) => `[${operandFormatter(operand[0])}, ${operandFormatter(operand[1])}[`,
    [TYPES.day_of_week]: ({ operand, operandFormatter }) => {
      const day_from = Math.floor(operand[0]);
      const day_to = Math.floor(operand[1]);
      // If there is only one day in the interval
      if ((day_to - day_from == 1) || (day_from == 6 && day_to == 0)){
        return operandFormatter(day_from);
      }
      else {
        return `${operandFormatter(day_from)} to ${operandFormatter((7 + day_to - 1) % 7)}`;
      }
    },
    [TYPES.day_of_month]: ({ operand, operandFormatter }) => `[${operandFormatter(operand[0])} to ${operandFormatter(operand[1])}[`,
    [TYPES.month_of_year]: ({ operand, operandFormatter }) => {
      const month_from = Math.floor(operand[0]);
      const month_to = Math.floor(operand[1]);
      if ((month_to - month_from == 1) || (month_from == 12 && month_to == 1)){
        // One month in the interval
        return operandFormatter(month_from);
      }
      else if (month_to == 1) {
        // (Excluded) upper bound is january
        return `${operandFormatter(month_from)} to ${operandFormatter(12)}`;
      }
      else {
        return `${operandFormatter(month_from)} to ${operandFormatter(month_to - 1)}`;
      }
    }
  },
  [OPERATORS.GTE]: {
    [TYPE_ANY]: ({ operand, operandFormatter }) => `>= ${operandFormatter(operand)}`
  },
  [OPERATORS.LT]: {
    [TYPE_ANY]: ({ operand, operandFormatter }) => `< ${operandFormatter(operand)}`
  }
};

export function formatDecisionRule({ operand, operator, type }) {
  const operatorFormatters = FORMATTER_FROM_DECISION_RULE[operator];
  if (!operatorFormatters) {
    throw new Error(`Unable to format the given decision rule: unknown operator '${operator}'.`);
  }
  const formatter = operatorFormatters[type] || operatorFormatters[TYPE_ANY];
  const operandFormatter = formatProperty(type || TYPE_ANY);
  return formatter({ type, operator, operandFormatter, operand });
}

const REDUCER_FROM_DECISION_RULE = {
  [OPERATORS.IS]: {
    [OPERATORS.IS]: (decisionRule1, decisionRule2) => {
      if (decisionRule1.operand && decisionRule1.operand != decisionRule2.operand) {
        throw new Error(`Operator "${OPERATORS.IS}" can't have different value. Set to "${decisionRule1.operand}" and receive "${decisionRule2.operand}"`);
      }
      return {
        operator: OPERATORS.IS,
        operand: decisionRule2.operand
      };
    }
  },
  [OPERATORS.IN]: {
    [OPERATORS.IN]: (decisionRule1, decisionRule2) => {
      const [o1From, o1To] = decisionRule1.operand;
      const [o2From, o2To] = decisionRule2.operand;

      const o1IsCyclic = o1From > o1To;
      const o2IsCyclic = o2From > o2To;
      const o2FromInO1 = o1IsCyclic ? (o2From >= o1From || o2From <= o1To) : (o2From >= o1From && o2From <= o1To);
      const o2ToInO1 = o1IsCyclic ? (o2To >= o1From || o2To <= o1To) : (o2To >= o1From && o2To <= o1To);
      const o1FromInO2 = o2IsCyclic ? (o1From >= o2From || o1From <= o2To) : (o1From >= o2From && o1From <= o2To);
      const o1ToInO2 = o2IsCyclic ? (o1To >= o2From || o1To <= o2To) : (o1To >= o2From && o1To <= o2To);

      if (o1FromInO2 && o1ToInO2) {
        // o1 belongs to o2
        //    |    o1    |
        //   |       o2       |
        return decisionRule1;
      }

      if (o2FromInO1 && o2ToInO1) {
        // o2 belongs to o1
        //    |    o1    |
        //      |  o2  |
        return decisionRule2;
      }

      if (o2FromInO1 && o1ToInO2) {
        // overlap 1
        //    |    o1    |
        //             |   o2   |
        return {
          operator: OPERATORS.IN,
          operand: [o2From, o1To]
        };
      }

      if (o2ToInO1 && o1FromInO2) {
        // overlap 2
        //        |    o1    |
        //     |   o2   |
        return {
          operator: OPERATORS.IN,
          operand: [o1From, o2To]
        };
      }

      // disjointed
      //    |    o1    |
      //                  |   o2   |
      throw new Error(`Unable to reduce decision rules '${formatDecisionRule(decisionRule1)}' and '${formatDecisionRule(decisionRule2)}': the resulting rule is not fulfillable.`);
    },
    [OPERATORS.GTE]: (decisionRule1, decisionRule2) => {
      const [o1From, o1To] = decisionRule1.operand;
      const o2 = decisionRule2.operand;

      const o1IsCyclic = o1From > o1To;

      if (o1IsCyclic) {
        // Cyclics makes no sense with single bound limits
        throw new Error(`Unable to reduce decision rules '${formatDecisionRule(decisionRule1)}' and '${formatDecisionRule(decisionRule2)}': the resulting rule is not fulfillable.`);
      }

      if (o2 >= o1To) {
        // o2 after o1, disjointed
        //    |    o1    |
        //                  |o2
        throw new Error(`Unable to reduce decision rules '${formatDecisionRule(decisionRule1)}' and '${formatDecisionRule(decisionRule2)}': the resulting rule is not fulfillable.`);
      }

      if (o2 >= o1From && o2 < o1To) {
        // o2 belongs to o1
        //    |    o1    |
        //           |o2
        return {
          operator: OPERATORS.IN,
          operand: [o2, o1To]
        };
      }

      // o2 before o1
      //    |    o1    |
      //   |o2
      return decisionRule1;
    },
    [OPERATORS.LT]: (decisionRule1, decisionRule2) => {
      const [o1From, o1To] = decisionRule1.operand;
      const o2 = decisionRule2.operand;

      const o1IsCyclic = o1From > o1To;

      if (o1IsCyclic) {
        // Cyclics makes no sense with single bound limits
        throw new Error(`Unable to reduce decision rules '${formatDecisionRule(decisionRule1)}' and '${formatDecisionRule(decisionRule2)}': the resulting rule is not fulfillable.`);
      }

      if (o2 < o1From) {
        // o2 before o1, disjointed
        //      |    o1    |
        // o2|
        throw new Error(`Unable to reduce decision rules '${formatDecisionRule(decisionRule1)}' and '${formatDecisionRule(decisionRule2)}': the resulting rule is not fulfillable.`);
      }

      if (o2 >= o1From && o2 < o1To) {
        // o2 belongs to o1
        //    |    o1    |
        //         o2|
        return {
          operator: OPERATORS.IN,
          operand: [o1From, o2]
        };
      }

      // o2 after o1
      //    |    o1    |
      //                 o2|
      return decisionRule1;
    }
  },
  [OPERATORS.GTE]: {
    [OPERATORS.IN]: (decisionRule1, decisionRule2) => REDUCER_FROM_DECISION_RULE[OPERATORS.IN][OPERATORS.GTE](decisionRule2, decisionRule1),
    [OPERATORS.GTE]: (decisionRule1, decisionRule2) => ({
      operator: OPERATORS.GTE,
      operand: Math.max(decisionRule1.operand, decisionRule2.operand)
    }),
    [OPERATORS.LT]: (decisionRule1, decisionRule2) => {
      const newLowerBound = decisionRule1.operand;
      const newUpperBound = decisionRule2.operand;
      if (newUpperBound < newLowerBound) {
        throw new Error(`Unable to reduce decision rules '${formatDecisionRule(decisionRule1)}' and '${formatDecisionRule(decisionRule2)}': the resulting rule is not fulfillable.`);
      }
      return {
        operator: OPERATORS.IN,
        operand: [newLowerBound, newUpperBound]
      };
    }
  },
  [OPERATORS.LT]: {
    [OPERATORS.IN]: (decisionRule1, decisionRule2) => REDUCER_FROM_DECISION_RULE[OPERATORS.IN][OPERATORS.LT](decisionRule2, decisionRule1),
    [OPERATORS.GTE]: (decisionRule1, decisionRule2) => REDUCER_FROM_DECISION_RULE[OPERATORS.GTE][OPERATORS.LT](decisionRule2, decisionRule1),
    [OPERATORS.LT]: (decisionRule1, decisionRule2) => ({
      operator: OPERATORS.LT,
      operand: Math.min(decisionRule1.operand, decisionRule2.operand)
    })
  }
};

export function decisionRuleReducer(decisionRule1, decisionRule2) {
  if (!decisionRule1 || !decisionRule2) {
    return decisionRule1 || decisionRule2;
  }
  const reducer = REDUCER_FROM_DECISION_RULE[decisionRule1.operator][decisionRule2.operator];
  if (!reducer) {
    throw new Error(`Unable to reduce decision rules '${formatDecisionRule(decisionRule1)}' and '${formatDecisionRule(decisionRule2)}': incompatible operators.`);
  }
  return reducer(decisionRule1, decisionRule2);
}

export function reduceDecisionRule(decisionRules) {
  return _.reduce(decisionRules, decisionRuleReducer, undefined);
}
