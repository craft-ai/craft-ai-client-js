import _ from 'lodash';
import { reduceDecisionRules } from './reducer';
import { tzFromOffset } from './time';
import { CraftAiDecisionError, CraftAiNullDecisionError, CraftAiUnknownError } from './errors';
import { formatDecisionRules, formatProperty } from './formatter';
import isTimezone, { getTimezoneKey } from './timezones';

const DECISION_FORMAT_VERSION = '2.0.0';

const OPERATORS = {
  'is': (context, value) => {
    if (_.isObject(context) && _.isObject(value)) {
      return _.isEmpty(context) && _.isEmpty(value);
    }
    else {
      return context === value;
    }
  },
  '>=': (context, value) => !_.isNull(context) && context * 1 >= value,
  '<': (context, value) => !_.isNull(context) && context * 1 < value,
  '[in[': (context, value) => {
    let context_val = context * 1;
    let from = value[0];
    let to = value[1];
    //the interval is not looping
    if (from < to) {
      return (!_.isNull(context) && context_val >= from && context_val < to);
    }
    //the interval IS looping
    else {
      return (!_.isNull(context) && (context_val >= from || context_val < to));
    }
  },
  'in': (context, value) => value.indexOf(context) > -1
};

const VALUE_VALIDATOR = {
  continuous: (value) => _.isFinite(value),
  enum: (value) => _.isString(value),
  boolean: (value) => _.isBoolean(value),
  timezone: (value) => isTimezone(value),
  time_of_day: (value) => _.isFinite(value) && value >= 0 && value < 24,
  day_of_week: (value) => _.isInteger(value)  && value >= 0 && value <= 6,
  day_of_month: (value) => _.isInteger(value)  && value >= 1 && value <= 31,
  month_of_year: (value) => _.isInteger(value)  && value >= 1 && value <= 12
};

function decideRecursion(node, context, configuration, outputType, outputValues) {
  // Leaf
  if (!(node.children && node.children.length)) {
    const prediction = node.prediction;
    if (prediction.value == null) {
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
      predicted_value: prediction.value,
      confidence: prediction.confidence || 0,
      decision_rules: [],
      nb_samples: prediction.nb_samples
    };
    
    if (!_.isUndefined(prediction.distribution.standard_deviation)) {
      leafNode.standard_deviation = prediction.distribution.standard_deviation;
    }
    else {
      leafNode.distribution = prediction.distribution;
    }

    return leafNode;
  }

  // Regular node
  const matchingChild = _.find(
    node.children,
    (child) => {
      const decision_rule = child.decision_rule;
      const property = decision_rule.property;
      if (configuration.deactivate_missing_values && _.isNull(property)) {
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
    if (!configuration.deactivate_missing_values) {
      const { value, size } = _distribution(node);
      let finalResult = {};
      // If it is a classification problem we return the class with the highest
      // probability. Otherwise, if the current output type is continuous/periodic
      // then the returned value corresponds to the subtree weighted output values.
      if (outputType === 'enum' || outputType === 'boolean') {
        // Compute the argmax function on the returned distribution:
        let argmax 
          = value
            .map((x, i) => [x, i])
            .reduce((r, a) => (a[0] > r[0] ? a : r))[1];
        
        const predicted_value = outputValues[argmax];
        finalResult = {
          predicted_value: predicted_value,
          distribution: value
        };
      }
      else {
        finalResult = {
          predicted_value: value
        };
      }
      return _.extend(finalResult, {
        confidence: null,
        decision_rules: [],
        nb_samples: size 
      });
    }
    else {
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
  }
  // matching child found: recurse !
  const result = decideRecursion(matchingChild, context, configuration, outputType, outputValues);

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
      is_optional: configuration.context[property].is_optional,
      validator: VALUE_VALIDATOR[configuration.context[property].type] || otherValidator
    };
  });

  return (context) => {
    const { badProperties, missingProperties } = _.reduce(
      validators,
      ({ badProperties, missingProperties }, { property, type, is_optional, validator }) => {
        const value = context[property];
        const isNullAuthorized = _.isNull(value) && !configuration.deactivate_missing_values;
        const isOptionalAuthorized = _.isEmpty(value) && is_optional;
        if (value === undefined) {
          missingProperties.push(property);
        }
        else if (!validator(value) && !isNullAuthorized && !isOptionalAuthorized) {
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

function _distribution(node) {
  if (!(node.children && node.children.length)) {
    // If the distribution attribute is an array it means that it is
    // a classification problem. We therefore compute the distribution of
    // the classes in this leaf and return the branch size.
    if (_.isArray(node.prediction.distribution)) {
      return { value: node.prediction.distribution, size: node.prediction.nb_samples };
    }
    // Otherwise it is a regression problem, and we return the mean value 
    // of the leaf and the branch size.
    return { value: node.prediction.value, size: node.prediction.nb_samples };
  }

  // If it is not a leaf, we recurse into the children and store the distributions
  // and sizes of each child branch.
  const { values, sizes } = _.map(node.children, (child) => _distribution(child))
    .reduce((acc, { value, size }) => {
      acc.values.push(value);
      acc.sizes.push(size);
      return acc;
    }, { values: [], sizes: [] });
  
  if (_.isArray(values[0])) {
    return computeMeanDistributions(values, sizes);
  }
  return computeMeanValues(values, sizes);
}

export function computeMeanValues(values, sizes) {
  // Compute the weighted mean of the given array of values.
  // Example, for values = [ 4, 3, 6 ], sizes = [1, 2, 1]
  // This function computes (4*1 + 3*2 + 1*6) / (1+2+1) = 16/4 = 4 
  let totalSize = _.sum(sizes);
  const mean = 
    _.zip(values, sizes)
      .map((zipped) => zipped[0] * (1.0 * zipped[1]) / (1.0 * totalSize))
      .reduce(_.add);
  return { value: mean, size: totalSize };
}

export function computeMeanDistributions(values, sizes) {
  // Compute the weighted mean of the given array of distributions (array of probabilities).
  // Example, for values = [[ 4, 3, 6 ], [1, 2, 3], [3, 4, 5]], sizes = [1, 2, 1]
  // This function computes ([ 4, 3, 6]*1 + [1, 2, 3]*2 + [3, 4, 5]*6) / (1+2+1) = ...
  let totalSize = _.sum(sizes);
  let multiplyByBranchRatio = 
  _.zip(values, sizes)
    .map((zipped) => _.map(zipped[0], (val) => val * zipped[1] / totalSize));
  let sumArrays = _sumArrays(multiplyByBranchRatio);
  return { value: sumArrays, size: totalSize };
}

function _sumArrays(arrays) {
  return _.reduce(arrays, (acc_sum, array) => 
    _.map(array, (val, i) => (acc_sum[i] || 0.) + val)
  , new Array(arrays[0].length));
}

function decide(configuration, trees, context) {
  checkContext(configuration)(context);
  // Convert timezones as integers to the standard +/-hh:mm format
  // This should only happen when no Time() object is passed to the interpreter
  const timezoneProperty = getTimezoneKey(configuration.context);
  if (!_.isUndefined(timezoneProperty)) {
    context[timezoneProperty] = tzFromOffset(context[timezoneProperty]);
  }
  return {
    _version: DECISION_FORMAT_VERSION,
    context,
    output: _.assign(..._.map(configuration.output, (output) => {
      const outputType = configuration.context[output].type;
      let decision = decideRecursion(trees[output], context, configuration, outputType, trees[output].output_values);
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
