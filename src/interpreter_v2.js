import { reduceDecisionRules } from './reducer';
import { tzFromOffset } from './time';
import * as _ from './lodash';
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

function decideRecursion(node, context, configuration, outputType, outputValues, path = ['0']) {
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
      nb_samples: prediction.nb_samples,
      decision_path: path.join('-')
    };

    if (!_.isUndefined(prediction.distribution.standard_deviation)) {
      leafNode.standard_deviation = prediction.distribution.standard_deviation;
      const min_value = prediction.distribution.min;
      const max_value = prediction.distribution.max;
      if (!_.isUndefined(min_value)) {
        leafNode.min = min_value;
      }
      if (!_.isUndefined(max_value)) {
        leafNode.max = max_value;
      }
    }
    else {
      leafNode.distribution = prediction.distribution;
    }

    return leafNode;
  }

  // Regular node
  const matchingChildIndex = node.children.findIndex(
    (child) => {
      const decision_rule = child.decision_rule;
      const property = decision_rule.property;
      return OPERATORS[decision_rule.operator](context[property], decision_rule.operand);
    }
  );
  const matchingChild = node.children[matchingChildIndex];

  // matching child property error
  if (matchingChild && matchingChild.error) {
    return matchingChild;
  }

  if (_.isUndefined(matchingChild)) {
    const { value, standard_deviation, size } = distribution(node);
    let finalResult = {};
    // If it is a classification problem we return the class with the highest
    // probability. Otherwise, if the current output type is continuous/periodic
    // then the returned value corresponds to the subtree weighted output values.
    if (outputType === 'enum' || outputType === 'boolean') {
      // Compute the argmax function on the returned distribution:
      const argmax
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
        predicted_value: value,
        standard_deviation: standard_deviation
      };
    }
    return _.extend(finalResult, {
      confidence: null,
      decision_rules: [],
      nb_samples: size,
      decision_path: path.join('-')
    });
  }
  // Add the matching child index to the current path:
  path.push(matchingChildIndex);

  // matching child found: recurse !
  const result = decideRecursion(matchingChild, context, configuration, outputType, outputValues, path);

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
      console.warn(`WARNING: "${configuration.context[property].type}" is not a supported type. Please refer to the documentation to see what type you can use`);
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
        const isOptional = _.isPlainObject(value) && _.isEmpty(value);
        if (value === undefined) {
          missingProperties.push(property);
        }
        else if (!validator(value) && !_.isNull(value) && !isOptional) {
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

export function distribution(node) {
  if (!(node.children && node.children.length)) {
    // If the distribution attribute is an array it means that it is
    // a classification problem. We therefore compute the distribution of
    // the classes in this leaf and return the branch size.
    if (_.isArray(node.prediction.distribution)) {
      return {
        value: node.prediction.distribution,
        size: node.prediction.nb_samples
      };
    }
    // Otherwise it is a regression problem, and we return the mean value
    // of the leaf, the standard_deviation and the branch size.
    return {
      value: node.prediction.value,
      standard_deviation: node.prediction.distribution.standard_deviation,
      size: node.prediction.nb_samples,
      min: node.prediction.distribution.min,
      max: node.prediction.distribution.max
    };
  }

  // If it is not a leaf, we recurse into the children and store the distributions
  // and sizes of each child branch.
  const { values, stds, sizes, mins, maxs } = _.map(node.children, (child) => distribution(child))
    .reduce((acc, { value, standard_deviation, size, min, max }) => {
      acc.values.push(value);
      acc.sizes.push(size);
      if (!_.isUndefined(standard_deviation)) {
        acc.stds.push(standard_deviation);
        acc.mins.push(min);
        acc.maxs.push(max);
      }
      return acc;
    }, {
      values: [],
      stds: [],
      sizes: [],
      mins: [],
      maxs: []
    });

  if (_.isArray(values[0])) {
    return computeMeanDistributions(values, sizes);
  }
  return computeMeanValues(values, sizes, stds, mins, maxs);
}

export function computeMeanValues(values, sizes, stds, mins, maxs) {
  // Compute the weighted mean of the given array of values.
  // Example, for values = [ 4, 3, 6 ], sizes = [1, 2, 1]
  // This function computes (4*1 + 3*2 + 1*6) / (1+2+1) = 16/4 = 4
  // If no standard deviation array is given, use classical weighted mean formula:
  if (_.isUndefined(stds)) {
    let totalSize = _.sum(sizes);
    const newMean =
      _.zip(values, sizes)
        .map(([mean, size]) => mean * (1.0 * size) / (1.0 * totalSize))
        .reduce(_.add);
    return {
      value: newMean,
      size: totalSize
    };
  }
  // Otherwise, to compute the weighted standard deviation the following formula is used:
  // https://math.stackexchange.com/questions/2238086/calculate-variance-of-a-subset
  const { mean, variance, size, min, max } =
    _.zip(values, stds, sizes, mins, maxs)
      .map(([mean, std, size, min, max]) => {
        return {
          mean: mean,
          variance: std * std,
          size: size,
          min: min,
          max: max
        };
      })
      .reduce((acc, { mean, variance, size, min, max }) => {
        if (_.isUndefined(acc.mean)) {
          return {
            mean: mean,
            variance: variance,
            size: size,
            min: min,
            max: max
          };
        }
        const totalSize = 1.0 * (acc.size + size);
        if (!totalSize > 0.0) {
          return {
            mean: acc.mean,
            variance: acc.variance,
            size: acc.size
          };
        }
        const newVariance = (1.0 / (totalSize - 1)) * (
          (acc.size - 1) * acc.variance
          + (size - 1) * variance
          + ((acc.size * size) / totalSize) * (acc.mean - mean) * (acc.mean - mean)
        );
        const newMean = (1.0 / totalSize) * (acc.size * acc.mean + size * mean);
        const newMin = min < acc.min ? min : acc.min;
        const newMax = max > acc.max ? max : acc.max;
        return {
          mean: newMean,
          variance: newVariance,
          size: totalSize,
          min: newMin,
          max: newMax
        };
      }, {
        mean: undefined,
        variance: undefined,
        size: undefined,
        min: undefined,
        max: undefined
      });
  return {
    value: mean,
    standard_deviation: Math.sqrt(variance),
    size: size,
    min: min,
    max: max
  };
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
  return arrays.reduce((acc_sum, array) =>
    _.map(array, (val, i) => (acc_sum[i] || 0.) + val)
  , new Array(arrays[0].length));
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
        const prediction = root.prediction;
        if (prediction.value == null) {
          throw new CraftAiNullDecisionError({
            message: 'Unable to take decision: the decision tree is not based on any context operations.'
          });
        }
      }

      const outputType = configuration.context[output].type;
      let decision = decideRecursion(trees[output], decide_context, configuration, outputType, trees[output].output_values);
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
