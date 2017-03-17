import _ from 'lodash';
import parse from './parse';
import context from './context';
import { CraftAiInternalError } from './errors';

let operators = {
  'continuous.equal'              : (context, value) => context  * 1 === value,
  'enum.equal'                    : (context, value) => context === value,
  'continuous.greaterthan'        : (context, value) => context * 1 > value,
  'continuous.greaterthanorequal' : (context, value) => context * 1 >= value,
  'continuous.lessthan'           : (context, value) => context * 1 < value,
  'continuous.lessthanorequal'    : (context, value) => context * 1 <= value,
  'interval.in'                   : (context, value) => {
    let context_val = context * 1;
    let from = value.interval.from_included;
    let to = value.interval.to_excluded;
    //the interval is not looping
    if (from < to) {
      return (context_val>=from && context_val<to);
    }
    //the interval IS looping
    else {
      return (context_val>=from || context_val<to);
    }
  }
};

function decideRecursion( node, context ) {
  // Leaf
  if ( _.isUndefined( node.predicate_property )) {
    return {
      value: node.value,
      confidence: node.confidence || 0,
      standard_deviation: node.standard_deviation, // may be undefined
      predicates: []
    };
  }

  // Regular node
  const property = node.predicate_property;
  if ( _.isUndefined(context[property]) ) {
    throw new Error( `Unable to take decision, property "${property}" is not defined in the given context.` );
  }

  const propertyValue = context[property];

  const matchingChild = _.find(
    node.children,
    child => operators[child.predicate.op](propertyValue, child.predicate.value));

  if (_.isUndefined(matchingChild)) {
    const valuesList = _.join(_.uniq(_.map(node.children, child => `'${child.predicate.value}'`)), ', ');
    throw new CraftAiInternalError({
      message: `Unable to take decision: "${propertyValue}" not found amongst "${property}" values`,
      metadata: {
        property: property,
        value: propertyValue,
        expectedValues: valuesList
      }
    });
  }

  // matching child found: recurse!
  const result = decideRecursion( matchingChild, context );
  return {
    value: result.value,
    confidence: result.confidence,
    standard_deviation: result.standard_deviation,
    predicates: [{
      property: property,
      op: matchingChild.predicate.op,
      value: matchingChild.predicate.value
    }].concat(result.predicates)
  };
}

export default function decide( json, ...args ) {
  const { tree, configuration } = parse(json);
  const ctx = configuration ? context(configuration, ...args) : _.extend({}, ...args);
  const rawDecision = decideRecursion(tree, ctx);
  const outputName = (configuration && configuration.output) ? configuration.output[0] : 'value';
  let decision = {};
  decision.decision = {};
  decision.decision[outputName] = rawDecision.value;
  if (!_.isUndefined(rawDecision.standard_deviation)) {
    decision.decision.standard_deviation = rawDecision.standard_deviation;
  }
  decision.confidence = rawDecision.confidence;
  decision.predicates = rawDecision.predicates;
  decision.context = ctx;
  return decision;
}
