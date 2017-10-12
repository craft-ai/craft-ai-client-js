import { interpreter } from '../src';

const DECISION_TREE_1 = require('./data/interpreter-test-suite/trees/enum.json');
const DECISION_TREE_2 = require('./data/interpreter-test-suite/trees/continuous.json');
const DECISION_TREE_3 = require('./data/interpreter-test-suite/trees/oneColor.json');

const INVALID_DECISION_TREE_1 = require('./data/interpreter-test-suite/trees/emptyArray.json');

describe('interpreter.getDecisionRulesProperties(<tree>)', function() {
  it('can list the properties used in a tree\'s decision rules (enum output)', function() {
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_1)).to.be.deep.equal([
      {
        'is_generated': true,
        'property': 'timeOfDay',
        'type': 'time_of_day'
      }
    ]);
  });
  it('can list the properties used in a tree\'s decision rules (continuous output)', function() {
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_2)).to.be.deep.equal([
      {
        'is_generated': true,
        'property': 'time',
        'type': 'time_of_day'
      },
      {
        'is_generated': true,
        'property': 'day',
        'type': 'day_of_week'
      },
      {
        'property': 'tz',
        'type': 'timezone'
      }
    ]);
  });
  it('can list the properties used in a tree\'s decision rules (single leaf)', function() {
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_3)).to.be.deep.equal([]);
  });
  it('works properly on invalid trees', function() {
    expect(() => interpreter.getDecisionRulesProperties(INVALID_DECISION_TREE_1)).to.throw;
  });
});
