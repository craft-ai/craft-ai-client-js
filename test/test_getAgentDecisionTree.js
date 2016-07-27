import craftai from '../src';
import parse from '../src/parse';

import MODEL_1 from './data/model_1.json';
import MODEL_1_OPERATIONS_1 from './data/model_1_operations_1.json';

const MODEL_1_OPERATIONS_1_TO = _.last(MODEL_1_OPERATIONS_1).timestamp;

describe('client.getAgentDecisionTree(<agentId>, <timestamp>)', function() {
  let client;
  let agent;
  const agentId = 'get_agent_decision_tree_agent';
  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });
  beforeEach(function() {
    return client.deleteAgent(agentId) // Delete any preexisting agent with this id.
      .then(() => client.createAgent(MODEL_1, agentId))
      .then(createdAgent => {
        expect(createdAgent).to.be.ok;
        agent = createdAgent;
        return client.addAgentContextOperations(agent.id, MODEL_1_OPERATIONS_1);
      });
  });
  afterEach(function() {
    return client.deleteAgent(agentId);
  });
  it('should succeed when using valid parameters', function() {
    return client.getAgentDecisionTree(agent.id, MODEL_1_OPERATIONS_1_TO + 200)
      .then(treeJson => {
        expect(treeJson).to.be.ok;
        const { tree, model } = parse(treeJson);
        expect(tree).to.be.ok;
        expect(model).to.be.deep.equal(model);
      });
  });
});
