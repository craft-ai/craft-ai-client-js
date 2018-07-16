import { formatDecisionRules, formatProperty as _formatProperty } from './formatter';
import { reduceDecisionRules } from './reducer';
import { deprecation, OPERATORS, TYPES } from './constants';

export function reduceDecisionRule(decisionRules) {
  deprecation('Properties.reduceDecisionRule', 'interpreter.reduceDecisionRules');
  const [output] = reduceDecisionRules(decisionRules);
  return output;
}

export function formatDecisionRule(decisionRule) {
  deprecation('Properties.formatDecisionRule', 'interpreter.formatDecisionRules');
  return formatDecisionRules([decisionRule]);
}

export function formatProperty(property) {
  deprecation('Properties.formatProperty', 'interpreter.formatProperty');
  return _formatProperty(property);
}

export { OPERATORS, TYPES };
