import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';

import craftai from '../src';
import parse from '../src/parse';

const CONFIGURATION_1_OPERATIONS_1_TO = _.last(CONFIGURATION_1_OPERATIONS_1).timestamp;

describe('client.getAgentDecisionTree(<agentId>, <timestamp>)', function() {
  let client;
  let agent;
  const agentId = `get_agent_decision_tree_${RUN_ID}`;
  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });
  beforeEach(function() {
    return client.deleteAgent(agentId) // Delete any preexisting agent with this id.
      .then(() => client.createAgent(CONFIGURATION_1, agentId))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        agent = createdAgent;
        return client.addAgentContextOperations(agent.id, CONFIGURATION_1_OPERATIONS_1);
      });
  });
  afterEach(function() {
    return client.deleteAgent(agentId);
  });
  it('should succeed when using valid parameters', function() {
    return client.getAgentDecisionTree(agent.id, CONFIGURATION_1_OPERATIONS_1_TO + 200)
      .then((treeJson) => {
        expect(treeJson).to.be.ok;
        const { _version, configuration, trees } = parse(treeJson);
        expect(trees).to.be.ok;
        expect(_version).to.be.ok;
        expect(configuration).to.be.deep.equal(configuration);
      });
  });
});
