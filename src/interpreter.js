import _ from 'lodash';
import context from './context';
import parse from './parse';
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
  continuous: (value) => _.isFinite(value) || _.isNull(value),
  enum: (value) => _.isString(value),
  timezone: (value) => isTimezone(value),
  time_of_day: (value) => _.isFinite(value) && value >= 0 && value < 24,
  day_of_week: (value) => _.isInteger(value)  && value >= 0 && value <= 6,
  day_of_month: (value) => _.isInteger(value)  && value >= 1 && value <= 31,
  month_of_year: (value) => _.isInteger(value)  && value >= 1 && value <= 12
};

function reduceNodes(tree, fn, initialAccValue) {
  let nodes = [];
  nodes.push(tree);
  const recursiveNext = (acc) => {
    if (nodes.length == 0) {
      // No more nodes
      return acc;
    }

    const node = nodes.pop();
    if (node.children) {
      nodes = node.children.concat(nodes);
    }

    const updatedAcc = fn(acc, node);
    return recursiveNext(updatedAcc);
  };
  return recursiveNext(initialAccValue);
}

function decideRecursion(node, context, configuration, output_values) {
  // Leaf
  if (!(node.children && node.children.length)) {
    // V2 compatibility, get 'prediction' object if it exists.
    const prediction = (!_.isUndefined(node.prediction)) ? node.prediction : node;
    if (prediction.predicted_value == null) {
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
      decision_rules: []
    };

    if (!_.isUndefined(prediction.distribution.standard_deviation)) {
      leafNode.standard_deviation = prediction.distribution.standard_deviation;
    }
    else if (!_.isUndefined(prediction.standard_deviation)) {
      leafNode.standard_deviation = prediction.standard_deviation;
    }

    return leafNode;
  }

  // Regular node
  const matchingChild = _.find(
    node.children,
    (child) => {
      const decision_rule = child.decision_rule;
      const property = decision_rule.property;
      if (configuration.deactivate_missing_values == true) {
        return {
          predicted_value: undefined,
          confidence: undefined,
          error: {
            name: 'CraftAiUnknownError',
            message: `Unable to take decision: property '${property}' is missing from the given context.`
          }
        };
      }

      // TODO

      // if (_.isUndefined(context[property])) {
      //   // Should not happen
      //   return {
      //     predicted_value: undefined,
      //     confidence: undefined,
      //     error: {
      //       name: 'CraftAiUnknownError',
      //       message: `Unable to take decision: property '${property}' is missing from the given context.`
      //     }
      //   };
      // }

      return OPERATORS[decision_rule.operator](context[property], decision_rule.operand);
    }
  );

  // matching child property error
  if (matchingChild && matchingChild.error) {
    return matchingChild;
  }

  if (_.isUndefined(matchingChild)) {
    if (configuration.deactivate_missing_values == false) {
      let predicted_value = _distribution(node);
      // If it is a classification problem we return the class witht he highest
      // probability. Otherwise we return the computed mean value.
      if (_.isArray(predicted_value.distribution[0])) {
        // Compute the argmax function on the returned distribution
        let argmax 
          = predicted_value.distribution
            .map((x, i) => [x, i])
            .reduce((r, a) => (a[0] > r[0] ? a : r))[1];
        predicted_value = output_values[argmax];
      }
      return {
        predicted_value: predicted_value,
        confidence: null,
        decision_rules: []
      };
    }
    else { // TODO
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
  const result = decideRecursion(matchingChild, context, configuration, output_values);

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

function _distribution(node) {
  if (!(node.children && node.children.length)) {
    const prediction = (!_.isUndefined(node.prediction)) ? node.prediction : node;
    let valueDistribution = prediction.distribution;
    // If there is no distribution attribute it means that it is
    // a classification problem. We therefore compute the distribution of
    // the classes in this leaf and return the weighted branch size.
    if (!_.isUndefined(valueDistribution)) {
      return { distribution: valueDistribution, size: prediction.nb_samples };
    }
    // Otherwise it is a regression problem, and we return the mean value 
    // of the leaf and the branch size.
    return { distribution: [prediction.predicted_value], size: prediction.nb_samples };
  }

  // If it is not a leaf, we recurse into the children and store the distributions
  // and sizes of each child branch.
  let distSize = _.map(node.children, (child) => _distribution(child))
    .reduce((acc, r) => {
      acc.distributions.push(r.distribution);
      acc.sizes.push(r.size);
      return acc;
    }, { distributions: [], sizes: [] });

  return computeMean(distSize);
}

export function computeMean(distSizes) {
  let totalSize = _.sum(distSizes.sizes);
  let multiplyByBranchRatio = 
  _.zip(distSizes.distributions, distSizes.sizes)
    .map((zipped) => _.map(zipped[0], (val) => val * zipped[1] / totalSize));
  let sumArrays = _sumArrays(multiplyByBranchRatio);
  return { distribution: sumArrays, size: totalSize };
}

function _sumArrays(arrays) {
  return _.reduce(arrays, (acc_sum, array) => 
    _.map(array, (val, i) => (acc_sum[i] || 0.) + val)
  , new Array(arrays[0].length));
}

function _decide(configuration, trees, context) {
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
      let decision = decideRecursion(trees[output], context, configuration, trees[output].output_values);
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

export function decideFromContextsArray(tree, contexts) {
  const { configuration, trees } = parse(tree);
  return _.map(contexts, (contextsItem) => {
    let ctx;
    if (_.isArray(contextsItem)) {
      ctx = context(configuration, ...contextsItem);
    }
    else {
      ctx = context(configuration, contextsItem);
    }
    try {
      return _decide(configuration, trees, ctx);
    }
    catch (error) {
      if (error instanceof CraftAiNullDecisionError) {
        const { message, metadata } = error;
        return {
          _version: DECISION_FORMAT_VERSION,
          context: ctx,
          error: { message, metadata }
        };
      }
      else {
        throw error;
      }
    }
  });
}

export function decide(tree, ...args) {
  const { configuration, trees } = parse(tree);
  const ctx = configuration ? context(configuration, ...args) : _.extend({}, ...args);
  return _decide(configuration, trees, ctx);
}

export function getDecisionRulesProperties(tree) {
  const { configuration, trees } = parse(tree);

  return _(trees)
    .values()
    .reduce(
      (properties, tree) => reduceNodes(
        tree,
        (properties, node) => {
          if (node.children) { // Skip leaves
            return properties.concat(node.children[0].decision_rule.property);
          }
          return properties;
        },
        properties),
      _([])
    )
    .uniq()
    .map((property) => _.extend(configuration.context[property], {
      property: property
    }))
    .value();
}

export { formatDecisionRules, formatProperty, reduceDecisionRules };
