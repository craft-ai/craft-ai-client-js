import { interpreter, Time } from '../src';

const DECISION_TREE_ENUM = require('./data/interpreter-test-suite/trees/enum.json');
const EXPECTATION_DECISION_TREE_ENUM = require('./data/interpreter-test-suite/expectations/enum.json');
const DECISION_TREE_UNKNOWN_OUTPUT = require('./data/interpreter-test-suite/trees/unknownOutput.json');
const EXPECTATION_DECISION_TREE_UNKNOWN_OUTPUT = require('./data/interpreter-test-suite/expectations/unknownOutput.json');


describe('interpreter.decideFromContextsArray', () => {
  it('works on an array of contexts', function() {
    const interestingExpectations = _.filter(EXPECTATION_DECISION_TREE_ENUM, (expectation) => expectation.error === undefined);
    const contexts = _.map(interestingExpectations, (expectation) => ([
      expectation.context,
      expectation.time ? new Time(expectation.time.t, expectation.time.tz) : {}
    ]));
    const decisions = _.map(interestingExpectations, (expectation) => expectation.output);
    expect(interpreter.decideFromContextsArray(DECISION_TREE_ENUM, contexts)).to.be.deep.equal(decisions);
  });
  it('gather \'CraftAiNullDecisionError\' instead of throwing them', function() {
    const contexts = _.map(EXPECTATION_DECISION_TREE_UNKNOWN_OUTPUT, (expectation) => ([
      expectation.context,
      expectation.time ? new Time(expectation.time.t, expectation.time.tz) : {}
    ]));
    const decisions = _.map(EXPECTATION_DECISION_TREE_UNKNOWN_OUTPUT, (expectation) => (expectation.output || {
      _version: '1.1.0',
      context: expectation.context,
      error: expectation.error
    }));
    console.log(interpreter.decideFromContextsArray(DECISION_TREE_UNKNOWN_OUTPUT, contexts)[0].error.metadata);
    expect(interpreter.decideFromContextsArray(DECISION_TREE_UNKNOWN_OUTPUT, contexts)).to.be.deep.equal(decisions);
  });
});
