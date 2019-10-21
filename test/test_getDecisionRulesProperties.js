import { interpreter } from '../src';

const DECISION_TREE_1_V1 = require('./data/interpreter-test-suite/decide/trees/v1/enum.json');
const DECISION_TREE_2_V1 = require('./data/interpreter-test-suite/decide/trees/v1/continuous.json');
const DECISION_TREE_3_V1 = require('./data/interpreter-test-suite/decide/trees/v1/oneColor.json');

const DECISION_TREE_1_V2 = require('./data/interpreter-test-suite/decide/trees/v2/enum.json');
const DECISION_TREE_2_V2 = require('./data/interpreter-test-suite/decide/trees/v2/continuous.json');
const DECISION_TREE_3_V2 = require('./data/interpreter-test-suite/decide/trees/v2/oneColor.json');
const DECISION_TREE_4_V2 = require('./data/interpreter-test-suite/decide/trees/v2/optional_branch_enum.json');
const DECISION_TREE_5_V2 = require('./data/interpreter-test-suite/decide/trees/v2/boolean_operator.json');

const INVALID_DECISION_TREE_1 = require('./data/interpreter-test-suite/decide/trees/v1/emptyArray.json');

describe('interpreter.getDecisionRulesProperties(<tree>)', function() {
  it('can list the properties used in a tree\'s decision rules (enum output)', function() {
    const expected_output = [
      {
        'is_generated': true,
        'property': 'timeOfDay',
        'type': 'time_of_day'
      }
    ];
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_1_V1)).to.be.deep.equal(expected_output);
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_1_V2)).to.be.deep.equal(expected_output);
  });

  it('can list the properties used in a tree\'s decision rules (continuous output)', function() {
    const expected_output = [
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
    ];
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_2_V1)).to.be.deep.equal(expected_output);
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_2_V2)).to.be.deep.equal(expected_output);
  });

  it('can list the properties used in a tree\'s decision rules (optional property)', function() {
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_4_V2)).to.be.deep.equal([
      {
        'property': 'enum4',
        'type': 'enum'
      },
      {
        'property': 'continuous3',
        'type': 'continuous'
      },
      {
        'property': 'continuous5',
        'type': 'continuous'
      },
      {
        'property': 'continuous4',
        'type': 'continuous'
      },
      {
        'property': 'enum1',
        'type': 'enum'
      },
      {
        'property': 'enum5',
        'type': 'enum'
      },
      {
        'property': 'enum2',
        'type': 'enum',
        'is_optional': true
      },
      {
        'property': 'enum3',
        'type': 'enum'
      },
      {
        'property': 'enum6',
        'type': 'enum'
      },
      {
        'property': 'continuous2',
        'type': 'continuous'
      },
      {
        'property': 'continuous6',
        'type': 'continuous'
      },
      {
        'property': 'enum7',
        'type': 'enum'
      },
      {
        'property': 'continuous1',
        'type': 'continuous'
      }
    ]);
  });

  it('can list the properties used in a tree\'s decision rules (boolean operator)', function() {
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_5_V2)).to.be.deep.equal([
      {
        'property': 'presence',
        'type': 'boolean'
      },
      {
        'property': 'timeOfDay',
        'type': 'time_of_day',
        'is_generated': true
      }
    ]);
  });

  it('can list the properties used in a tree\'s decision rules (single leaf)', function() {
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_3_V1)).to.be.deep.equal([]);
    expect(interpreter.getDecisionRulesProperties(DECISION_TREE_3_V2)).to.be.deep.equal([]);
  });

  it('works properly on invalid trees', function() {
    expect(() => interpreter.getDecisionRulesProperties(INVALID_DECISION_TREE_1)).to.throw;
  });
});
