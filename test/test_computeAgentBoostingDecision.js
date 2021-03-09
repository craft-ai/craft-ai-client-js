import CONFIGURATION_1 from './data/configuration_1_boosting.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_3.json';
import craftai, { errors } from '../src';

const CONFIGURATION_1_OPERATIONS_1_FROM = _.first(CONFIGURATION_1_OPERATIONS_1).timestamp;
const CONFIGURATION_1_OPERATIONS_1_TO = _.last(CONFIGURATION_1_OPERATIONS_1).timestamp;

describe('client.computeAgentBoostingDecision(<agentId>, <fromTs>, <toTs>, <context>)', function() {
  let client;
  const AGENT_NAME = `compute_gen_dec_${RUN_ID}`;
  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.deleteAgent(AGENT_NAME)
      .then(() => client.createAgent(CONFIGURATION_1, AGENT_NAME))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        return client.addAgentContextOperations(AGENT_NAME, CONFIGURATION_1_OPERATIONS_1);
      });
  });

  after(function() {
    return client.deleteAgent(AGENT_NAME);
  });

  it('should fail when no agent name is given', function() {
    const undefinedAgentName = undefined;
    return client.computeAgentBoostingDecision(undefinedAgentName, CONFIGURATION_1_OPERATIONS_1_FROM, CONFIGURATION_1_OPERATIONS_1_TO, {
      presence: 'none',
      lightIntensity: 0.1
    })
      .catch((err) => expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError));
  });

  it('should fail when wrong timestamp is given', function() {
    return client.computeAgentBoostingDecision(AGENT_NAME, -1, CONFIGURATION_1_OPERATIONS_1_TO, {
      presence: 'none',
      lightIntensity: 0.1
    })
      .catch((err) => expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError));
  });

  it('should succeed when using valid parameters', function() {
    return client.computeAgentBoostingDecision(AGENT_NAME, CONFIGURATION_1_OPERATIONS_1_FROM, CONFIGURATION_1_OPERATIONS_1_TO, {
      presence: 'none',
      lightIntensity: 0.1
    })
      .then((decision) => {
        expect(decision).to.be.ok;
        expect(decision.output.predicted_value).to.be.equal('black');
      });
  });
});
