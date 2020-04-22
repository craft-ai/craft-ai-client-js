import _ from 'lodash';
import { reduceDecisionRules } from './reducer';
import { tzFromOffset } from './time';
import { CraftAiDecisionError, CraftAiNullDecisionError, CraftAiUnknownError } from './errors';
import { formatDecisionRules, formatProperty } from './formatter';
import isTimezone, { getTimezoneKey } from './timezones';

const DECISION_FORMAT_VERSION = '1.1.0';

const OPERATORS = {
  'is': (context, value) => context === value,
  '>=': (context, value) => context * 1 >= value,
  '<': (context, value) => context * 1 < value,
  '[in[': (context, value) => {
    let context_val = context * 1;
    let from = value[0];
    let to = value[1];
    //the interval is not looping
    if (from < to) {
      return (context_val >= from && context_val < to);
    }
    //the interval IS looping
    else {
      return (context_val >= from || context_val < to);
    }
  }
};

const VALUE_VALIDATOR = {
  continuous: (value) => _.isFinite(value),
  enum: (value) => _.isString(value),
  timezone: (value) => isTimezone(value),
  time_of_day: (value) => _.isFinite(value) && value >= 0 && value < 24,
  day_of_week: (value) => _.isInteger(value)  && value >= 0 && value <= 6,
  day_of_month: (value) => _.isInteger(value)  && value >= 1 && value <= 31,
  month_of_year: (value) => _.isInteger(value)  && value >= 1 && value <= 12
};

function decideRecursion(node, context) {
  // Leaf
  if (!(node.children && node.children.length)) {
    if (node.predicted_value == null) {
      return {
        predicted_value: undefined,
        confidence: undefined,
        decision_rules: [],
        error: {
          name: 'CraftAiNullDecisionError',
          message: 'Unable to take decision: the decision tree has no valid predicted value for the given context.'
        }
      };
    }

    let leafNode = {
      predicted_value: node.predicted_value,
      confidence: node.confidence || 0,
      decision_rules: []
    };

    if (!_.isUndefined(node.standard_deviation)) {
      leafNode.standard_deviation = node.standard_deviation;
    }

    return leafNode;
  }

  // Regular node
  const matchingChild = _.find(
    node.children,
    (child) => {
      const decision_rule = child.decision_rule;
      const property = decision_rule.property;
      if (_.isUndefined(context[property])) {
        // Should not happen
        return {
          predicted_value: undefined,
          confidence: undefined,
          error: {
            name: 'CraftAiUnknownError',
            message: `Unable to take decision: property '${property}' is missing from the given context.`
          }
        };
      }

      return OPERATORS[decision_rule.operator](context[property], decision_rule.operand);
    }
  );

  // matching child property error
  if (matchingChild && matchingChild.error) {
    return matchingChild;
  }

  if (_.isUndefined(matchingChild)) {
    // Should only happens when an unexpected value for an enum is encountered
    const operandList = _.uniq(_.map(_.values(node.children), (child) => child.decision_rule.operand));
    const property = _.head(node.children).decision_rule.property;
    return {
      predicted_value: undefined,
      confidence: undefined,
      decision_rules: [],
      error: {
        name: 'CraftAiNullDecisionError',
        message: `Unable to take decision: value '${context[property]}' for property '${property}' doesn't validate any of the decision rules.`,
        metadata: {
          property: property,
          value: context[property],
          expected_values: operandList
        }
      }
    };
  }

  // matching child found: recurse !
  const result = decideRecursion(matchingChild, context);

  let finalResult = _.extend(result, {
    decision_rules: [matchingChild.decision_rule].concat(result.decision_rules)
  });

  return finalResult;
}

function checkContext(configuration) {
  // Extract the required properties (i.e. those that are not the output)
  const expectedProperties = _.difference(
    _.keys(configuration.context),
    configuration.output
  );

  // Build a context validator
  const validators = _.map(expectedProperties, (property) => {
    const otherValidator = () => {
      console.warn(`WARNING: "${configuration.context[property].type}" is not a supported type. Please refer to the documention to see what type you can use`);
      return true;
    };
    return {
      property,
      type: configuration.context[property].type,
      validator: VALUE_VALIDATOR[configuration.context[property].type] || otherValidator
    };
  });

  return (context) => {
    const { badProperties, missingProperties } = _.reduce(
      validators,
      ({ badProperties, missingProperties }, { property, type, validator }) => {
        const value = context[property];
        if (value === undefined) {
          missingProperties.push(property);
        }
        else if (!validator(value)) {
          badProperties.push({ property, type, value });
        }
        return { badProperties, missingProperties };
      },
      { badProperties: [], missingProperties: [] }
    );

    if (missingProperties.length || badProperties.length) {
      const messages = _.concat(
        _.map(missingProperties, (property) => `expected property '${property}' is not defined`),
        _.map(badProperties, ({ property, type, value }) => `'${value}' is not a valid value for property '${property}' of type '${type}'`)
      );
      throw new CraftAiDecisionError({
        message: `Unable to take decision, the given context is not valid: ${messages.join(', ')}.`,
        metadata: _.assign({}, missingProperties.length && { missingProperties }, badProperties.length && { badProperties })
      });
    }
  };
}

function decide(configuration, trees, context) {
  checkContext(configuration)(context);
  // Convert timezones as integers to the standard +/-hh:mm format
  // This should only happen when no Time() object is passed to the interpreter
  const timezoneProperty = getTimezoneKey(configuration.context);
  const decide_context = timezoneProperty == null ? context : Object.assign({}, context, {
    [timezoneProperty]: tzFromOffset(context[timezoneProperty])
  });
  return {
    _version: DECISION_FORMAT_VERSION,
    context,
    output: _.assign(..._.map(configuration.output, (output) => {
      const root = trees[output];
      if (!(root.children && root.children.length)) {
        if (root.predicted_value === undefined) {
          throw new CraftAiNullDecisionError({
            message: 'Unable to take decision: the decision tree is not based on any context operations.'
          });
        }
      }

      let decision = decideRecursion(trees[output], decide_context);
      if (decision.error) {
        switch (decision.error.name) {
          case 'CraftAiNullDecisionError':
            throw new CraftAiNullDecisionError({
              message: decision.error.message,
              metadata: _.extend(decision.error.metadata, {
                decision_rules: decision.decision_rules
              })
            });
          default:
            throw new CraftAiUnknownError({
              message: decision.error.message
            });
        }
      }
      return {
        [output]: decision
      };
    }))
  };
}

export { formatDecisionRules, formatProperty, reduceDecisionRules, decide };