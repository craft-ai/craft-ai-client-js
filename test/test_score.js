import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_GENERATOR from './data/configuration_1_generator.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import { expect } from 'chai';
import craftai, { errors } from '../src';

describe('client.computeSlidingWindowScoresBulk([SCORE_REQUESTS])', function() {
  let client;
  const AGENT_NAME = `get_gen_decision_${RUN_ID}`;
  const GENERATOR_NAME = `generator_${RUN_ID}`;
  const CONFIGURATION_GET_DECISION_TREE = JSON.parse(JSON.stringify(CONFIGURATION_1_GENERATOR));
  CONFIGURATION_GET_DECISION_TREE.filter = [AGENT_NAME];
  const MODEL_TIMESTAMP = CONFIGURATION_1_OPERATIONS_1[Math.round((CONFIGURATION_1_OPERATIONS_1.length - 1) / 4)].timestamp;
  const TEST_FROM = CONFIGURATION_1_OPERATIONS_1[Math.round((CONFIGURATION_1_OPERATIONS_1.length - 1) / 2)].timestamp;
  const TEST_TO = _.last(CONFIGURATION_1_OPERATIONS_1).timestamp;
  const WINDOW_NUMBER = 5;
  const STEP = Math.ceil((TEST_TO - TEST_FROM) / WINDOW_NUMBER);

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.deleteAgent(AGENT_NAME)
      .then((res) => client.createAgent(CONFIGURATION_1, AGENT_NAME))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        return client.addAgentContextOperations(createdAgent.id, CONFIGURATION_1_OPERATIONS_1);
      })
      .then(() => client.deleteGenerator(GENERATOR_NAME))
      .then(() => client.createGenerator(CONFIGURATION_GET_DECISION_TREE, GENERATOR_NAME));
  });

  after(function() {
    return client.deleteAgent(AGENT_NAME)
      .then(() => client.deleteGenerator(GENERATOR_NAME));
  });

  it('computeSlidingWindowScoresBulk: Should succeed on valid parameters', () => {
    const SCORE_REQUEST = [
      {
        id: GENERATOR_NAME,
        test_from: TEST_FROM,
        test_to: TEST_TO,
        step: STEP
      }
    ];
    return client.computeSlidingWindowScoresBulk(SCORE_REQUEST)
      .then((res) => {
        expect(res).to.be.instanceOf(Array);
        expect(res[0].id).to.be.equal(GENERATOR_NAME);
        expect(res[0].scores).to.be.instanceOf(Array);
        expect(res[0].scores.length).to.be.equal(WINDOW_NUMBER);
        expect(res[0].scores[0]).to.be.include.keys(['accuracy', 'f1_weighted', 'f1']);
      });
  });

  it('computeSlidingWindowScoresBulk: Should handle mixed result', () => {
    const SCORE_REQUEST = [
      {
        id: GENERATOR_NAME,
        test_from: TEST_FROM,
        test_to: TEST_TO,
        step: STEP
      },
      {
        id: 'NOT_FOUND_GENERATOR',
        test_from: TEST_FROM,
        test_to: TEST_TO,
        step: STEP
      }
    ];
    return client.computeSlidingWindowScoresBulk(SCORE_REQUEST)
      .then((res) => {
        expect(res).to.be.instanceOf(Array);
        expect(res[0].id).to.be.equal(GENERATOR_NAME);
        expect(res[0].scores).to.be.instanceOf(Array);
        expect(res[0].scores.length).to.be.equal(WINDOW_NUMBER);
        expect(res[0].scores[0]).to.be.include.keys(['accuracy', 'f1_weighted', 'f1']);
        expect(res[1].status).to.be.equal(404);
        expect(res[1].name).to.be.equal('NotFound');
      });
  });

  it('computeSlidingWindowScoresBulk: Should fail when empty array', () => {
    const SCORE_REQUEST = [];
    try {
      return client.computeSlidingWindowScoresBulk(SCORE_REQUEST);
    }
    catch (err) {
      expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
    }
  });
  it('computeSingleWindowScoreBulk: Should succeed on valid parameters', () => {
    const SCORE_REQUEST = [
      {
        id: GENERATOR_NAME,
        test_from: TEST_FROM,
        test_to: TEST_TO,
        model_timestamp: MODEL_TIMESTAMP
      }
    ];
    return client.computeSingleWindowScoreBulk(SCORE_REQUEST)
      .then((res) => {
        expect(res).to.be.instanceOf(Array);
        expect(res[0].id).to.be.equal(GENERATOR_NAME);
        expect(res[0].score.from).to.be.equal(TEST_FROM);
        expect(res[0].score.to).to.be.equal(TEST_TO);
        expect(res[0].score.modelTimestamp).to.be.equal(MODEL_TIMESTAMP);
        expect(res[0].score).to.be.include.keys(['accuracy', 'f1_weighted', 'f1']);
      });
  });

  it('computeSingleWindowScoreBulk: Should handle mixed result', () => {
    const SCORE_REQUEST = [
      {
        id: GENERATOR_NAME,
        test_from: TEST_FROM,
        test_to: TEST_TO,
        model_timestamp: MODEL_TIMESTAMP
      },
      {
        id: 'NOT_FOUND_GENERATOR',
        test_from: TEST_FROM,
        test_to: TEST_TO
      }
    ];
    return client.computeSingleWindowScoreBulk(SCORE_REQUEST)
      .then((res) => {
        expect(res).to.be.instanceOf(Array);
        expect(res[0].id).to.be.equal(GENERATOR_NAME);
        expect(res[0].score).to.be.include.keys(['accuracy', 'f1_weighted', 'f1']);
        expect(res[1].status).to.be.equal(404);
        expect(res[1].name).to.be.equal('NotFound');
      });
  });

  it('computeSingleWindowScoreBulk: Should fail when empty array', () => {
    const SCORE_REQUEST = [];
    try {
      return client.computeSingleWindowScoreBulk(SCORE_REQUEST);
    }
    catch (err) {
      expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
    }
  });
});
