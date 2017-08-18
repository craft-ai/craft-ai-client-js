import CONFIGURATION_1 from './data/configuration_1.json';

import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import craftai from '../src';

const CONFIGURATION_1_OPERATIONS_1_TO = _.last(CONFIGURATION_1_OPERATIONS_1).timestamp;

describe('client.computeAgentDecision(<agentId>, <timestamp>, <context>)', function() {
  let client;
  let agent;
  const agentId = `compute_agent_decision_${RUN_ID}`;
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
    return client.computeAgentDecision(agent.id, CONFIGURATION_1_OPERATIONS_1_TO + 200, {
      presence: 'none',
      lightIntensity: 0.1
    })
      .then((decision) => {
        expect(decision).to.be.ok;
        expect(decision.output.lightbulbColor.predicted_value).to.be.equal('black');
      });
  });
  it('should succeed when using valid parameters (context override)', function() {
    return client.computeAgentDecision(agent.id, CONFIGURATION_1_OPERATIONS_1_TO + 200, {
      presence: 'none',
      lightIntensity: 1
    }, {
      lightIntensity: 0.1
    })
      .then((decision) => {
        expect(decision).to.be.ok;
        expect(decision.output.lightbulbColor.predicted_value).to.be.equal('black');
      });
  });
});
