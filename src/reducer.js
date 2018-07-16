import _ from 'lodash';
import { formatDecisionRules } from './formatter';
import { OPERATORS } from './constants';

const REDUCER_FROM_DECISION_RULE = {
  [OPERATORS.IS]: {
    [OPERATORS.IS]: (decisionRule1, decisionRule2) => {
      if (decisionRule1.operand && decisionRule1.operand != decisionRule2.operand) {
        throw new Error(`Operator "${OPERATORS.IS}" can't have different value. Set to "${decisionRule1.operand}" and receive "${decisionRule2.operand}"`);
      }
      return {
        property: decisionRule1.property,
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
          property: decisionRule1.property,
          operator: OPERATORS.IN,
          operand: [o2From, o1To]
        };
      }

      if (o2ToInO1 && o1FromInO2) {
        // overlap 2
        //        |    o1    |
        //     |   o2   |
        return {
          property: decisionRule1.property,
          operator: OPERATORS.IN,
          operand: [o1From, o2To]
        };
      }

      // disjointed
      //    |    o1    |
      //                  |   o2   |
      throw new Error(`Unable to reduce decision rules '${formatDecisionRules([decisionRule1])}' and '${formatDecisionRules([decisionRule2])}': the resulting rule is not fulfillable.`);
    },
    [OPERATORS.GTE]: (decisionRule1, decisionRule2) => {
      const [o1From, o1To] = decisionRule1.operand;
      const o2 = decisionRule2.operand;

      const o1IsCyclic = o1From > o1To;

      if (o1IsCyclic) {
        // Cyclics makes no sense with single bound limits
        throw new Error(`Unable to reduce decision rules '${formatDecisionRules([decisionRule1])}' and '${formatDecisionRules([decisionRule2])}': the resulting rule is not fulfillable.`);
      }

      if (o2 >= o1To) {
        // o2 after o1, disjointed
        //    |    o1    |
        //                  |o2
        throw new Error(`Unable to reduce decision rules '${formatDecisionRules([decisionRule1])}' and '${formatDecisionRules([decisionRule2])}': the resulting rule is not fulfillable.`);
      }

      if (o2 >= o1From && o2 < o1To) {
        // o2 belongs to o1
        //    |    o1    |
        //           |o2
        return {
          property: decisionRule1.property,
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
        throw new Error(`Unable to reduce decision rules '${formatDecisionRules([decisionRule1])}' and '${formatDecisionRules([decisionRule2])}': the resulting rule is not fulfillable.`);
      }

      if (o2 < o1From) {
        // o2 before o1, disjointed
        //      |    o1    |
        // o2|
        throw new Error(`Unable to reduce decision rules '${formatDecisionRules([decisionRule1])}' and '${formatDecisionRules([decisionRule2])}': the resulting rule is not fulfillable.`);
      }

      if (o2 >= o1From && o2 < o1To) {
        // o2 belongs to o1
        //    |    o1    |
        //         o2|
        return {
          property: decisionRule1.property,
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
      property: decisionRule1.property,
      operator: OPERATORS.GTE,
      operand: Math.max(decisionRule1.operand, decisionRule2.operand)
    }),
    [OPERATORS.LT]: (decisionRule1, decisionRule2) => {
      const newLowerBound = decisionRule1.operand;
      const newUpperBound = decisionRule2.operand;
      if (newUpperBound < newLowerBound) {
        throw new Error(`Unable to reduce decision rules '${formatDecisionRules([decisionRule1])}' and '${formatDecisionRules([decisionRule2])}': the resulting rule is not fulfillable.`);
      }
      return {
        property: decisionRule1.property,
        operator: OPERATORS.IN,
        operand: [newLowerBound, newUpperBound]
      };
    }
  },
  [OPERATORS.LT]: {
    [OPERATORS.IN]: (decisionRule1, decisionRule2) => REDUCER_FROM_DECISION_RULE[OPERATORS.IN][OPERATORS.LT](decisionRule2, decisionRule1),
    [OPERATORS.GTE]: (decisionRule1, decisionRule2) => REDUCER_FROM_DECISION_RULE[OPERATORS.GTE][OPERATORS.LT](decisionRule2, decisionRule1),
    [OPERATORS.LT]: (decisionRule1, decisionRule2) => ({
      property: decisionRule1.property,
      operator: OPERATORS.LT,
      operand: Math.min(decisionRule1.operand, decisionRule2.operand)
    })
  }
};

function decisionRuleReducer(decisionRule1, decisionRule2) {
  if (!decisionRule1 || !decisionRule2) {
    return decisionRule1 || decisionRule2;
  }
  const reducer = REDUCER_FROM_DECISION_RULE[decisionRule1.operator][decisionRule2.operator];
  if (!reducer) {
    throw new Error(`Unable to reduce decision rules '${formatDecisionRules([decisionRule1])}' and '${formatDecisionRules([decisionRule2])}': incompatible operators.`);
  }
  return reducer(decisionRule1, decisionRule2);
}

export function reduceDecisionRules(decisionRules) {
  const properties = _.uniq(_.map(decisionRules, ({ property }) => property));
  return _.map(properties, ((currentPropery) => _(decisionRules)
    .filter(({ property }) => property == currentPropery)
    .reduce(decisionRuleReducer, undefined)));
}
