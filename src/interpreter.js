import _ from 'lodash';
import context from './context';
import { decide as decideV1 } from './interpreter_v1';
import parse from './parse';
import { reduceDecisionRules } from './reducer';
import semver from 'semver';
import { CraftAiDecisionError, CraftAiNullDecisionError } from './errors';
import { decide as decideV2, distribution } from './interpreter_v2';
import { formatDecisionRules, formatProperty } from './formatter';

const DECISION_FORMAT_VERSION = '1.1.0';

export function decide(tree, ...args) {
  const { _version, configuration, trees } = parse(tree);
  const ctx = configuration ? context(configuration, ...args) : _.extend({}, ...args);
  return _decide(configuration, trees, ctx, _version);
}

function _decide(configuration, trees, ctx, _version) {
  if (semver.satisfies(_version, '>=1.0.0 <2.0.0')) {
    return decideV1(configuration, trees, ctx);
  }
  if (semver.satisfies(_version, '>=2.0.0 <3.0.0')) {
    return decideV2(configuration, trees, ctx);
  }
  throw new CraftAiDecisionError(`Invalid decision tree format, "${_version}" is not a valid version.`);
}

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

export function decideFromContextsArray(tree, contexts) {
  const { _version, configuration, trees } = parse(tree);
  return _.map(contexts, (contextsItem) => {
    let ctx;
    if (_.isArray(contextsItem)) {
      ctx = context(configuration, ...contextsItem);
    }
    else {
      ctx = context(configuration, contextsItem);
    }
    try {
      return _decide(configuration, trees, ctx, _version);
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

export { formatDecisionRules, formatProperty, reduceDecisionRules, distribution };
