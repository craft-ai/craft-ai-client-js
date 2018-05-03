import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_2 from './data/configuration_2.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';

import craftai, { errors } from '../src';
import parse from '../src/parse';

const CONFIGURATION_1_OPERATIONS_1_TO = _.last(CONFIGURATION_1_OPERATIONS_1).timestamp;

const CONFIGURATION_2_BATCH_DURATION = CONFIGURATION_2.learning_period * 4;
const CONFIGURATION_2_ENUM_VALUES = ['CYAN', 'MAGENTA', 'YELLOW', 'BLACK'];

function randomEnumValue() {
  return CONFIGURATION_2_ENUM_VALUES[_.random(0, CONFIGURATION_2_ENUM_VALUES.length - 1)];
}

function randomContinuousValue() {
  return _.random(-12, 12);
}

const CONFIGURATION_2_OPERATIONS = _.map(_.range(0, 60), (batchOffset) => {
  return _.map(_.range(0, CONFIGURATION_2_BATCH_DURATION, 1000), (operationOffset) => ({
    timestamp: batchOffset * CONFIGURATION_2_BATCH_DURATION + operationOffset,
    context: {
      e1: randomEnumValue(),
      e2: randomEnumValue(),
      e3: randomEnumValue(),
      e4: randomEnumValue(),
      c1: randomContinuousValue(),
      c2: randomContinuousValue(),
      c3: randomContinuousValue(),
      c4: randomContinuousValue(),
      tz: 'CET'
    }
  }));
});

describe('client.getAgentDecisionTree(<agentId>, <timestamp>)', function() {
  let client;
  let agent;
  const agentId = `get_agent_decision_tree_${RUN_ID}`;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });

  beforeEach(function() {
    return client.deleteAgent(agentId); // Delete any preexisting agent with this id.
  });

  afterEach(function() {
    return client.deleteAgent(agentId);
  });

  describe('on an agent with few data', function() {
    beforeEach(function() {
      return client.createAgent(CONFIGURATION_1, agentId)
        .then((createdAgent) => {
          expect(createdAgent).to.be.ok;
          agent = createdAgent;
          return client.addAgentContextOperations(agent.id, CONFIGURATION_1_OPERATIONS_1);
        });
    });

    it('should succeed when using valid parameters', function() {
      return client.getAgentDecisionTree(agent.id, CONFIGURATION_1_OPERATIONS_1_TO)
        .then((treeJson) => {
          expect(treeJson).to.be.ok;
          const { _version, configuration, trees } = parse(treeJson);
          expect(trees).to.be.ok;
          expect(_version).to.be.ok;
          expect(configuration).to.be.deep.equal(CONFIGURATION_1);
        });
    });

    it('should fail with a timeout error when the client side timeout is low', function() {
      const otherClient = craftai(_.assign({}, CRAFT_CFG, {
        decisionTreeRetrievalTimeout: 50
      }));
      return otherClient.getAgentDecisionTree(agent.id, CONFIGURATION_1_OPERATIONS_1_TO)
        .then(
          () => Promise.reject(new Error('Should not be reached')),
          (err) => {
            expect(err).to.be.an.instanceof(errors.CraftAiLongRequestTimeOutError);
          }
        );
    });
  });

  (DISABLE_LONG_TESTS ? describe.skip : describe)('on an agent with data spanning a looong time', function() {
    beforeEach(function() {
      return client.createAgent(CONFIGURATION_2, agentId)
        .then((createdAgent) => {
          expect(createdAgent).to.be.ok;
          agent = createdAgent;
          return _.reduce(CONFIGURATION_2_OPERATIONS, (p, operations) => {
            return p.then(() => client.addAgentContextOperations(agent.id, operations));
          }, Promise.resolve());
        });
    });

    it('should fail with a timeout error when the client side timeout is deactivated', function() {
      this.timeout(100000);
      const otherClient = craftai(_.assign({}, CRAFT_CFG, {
        decisionTreeRetrievalTimeout: false
      }));
      const lastOperation = _.last(_.last(CONFIGURATION_2_OPERATIONS));
      return otherClient.getAgentDecisionTree(agent.id, lastOperation.timestamp)
        .then(
          () => Promise.reject(new Error('Should not be reached')),
          (err) => {
            expect(err).to.be.an.instanceof(errors.CraftAiLongRequestTimeOutError);
          }
        );
    });

    it('should work with the standard timeout', function() {
      this.timeout(300000);
      const lastOperation = _.last(_.last(CONFIGURATION_2_OPERATIONS));
      return client.getAgentDecisionTree(agent.id, lastOperation.timestamp)
        .then((treeJson) => {
          expect(treeJson).to.be.ok;
          const { _version, configuration, trees } = parse(treeJson);
          expect(trees).to.be.ok;
          expect(_version).to.be.ok;
          expect(configuration).to.be.deep.equal(CONFIGURATION_2);
        });
    });
  });
});
