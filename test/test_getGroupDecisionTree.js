import _ from 'lodash';
import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import parse from '../src/parse';

import craftai, { errors } from '../src';

const CONFIGURATION_1_OPERATIONS_1_TO = _.last(CONFIGURATION_1_OPERATIONS_1).timestamp;

describe('client.getGroupDecisionTree(<agentList>, <timestamp>, <configuration>)', function() {
  let client;
  let agent;
  const agentId_1 = `get_agent_decision_tree_1_${RUN_ID}`;
  const agentId_2 = `get_agent_decision_tree_2_${RUN_ID}`;
  const agentId_list = [agentId_1, agentId_2];

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });
  beforeEach(function() {
    return client.deleteAgent(agentId_1) // Delete any preexisting agent with this id.
      .then(() => client.createAgent(CONFIGURATION_1, agentId_1))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        agent = createdAgent;
        return client.addAgentContextOperations(agent.id, CONFIGURATION_1_OPERATIONS_1);
      })
      .then(() => client.deleteAgent(agentId_2))
      .then(() => client.createAgent(CONFIGURATION_1, agentId_2))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        agent = createdAgent;
        return client.addAgentContextOperations(agent.id, CONFIGURATION_1_OPERATIONS_1);
      });
  });
  
  it('Return a decision tree when called with an agent list', () => {
    return client.getGroupDecisionTree(agentId_list)
      .then((treeJson) => {
        expect(treeJson).to.be.ok;
        const { _version, configuration, trees } = parse(treeJson);
        expect(trees).to.be.ok;
        expect(_version).to.be.ok;
        expect(configuration).to.be.deep.equal(CONFIGURATION_1);
      });
  });

  it('Return a different decision tree when called with a different timestamp', () => {
    return client.getGroupDecisionTree(agentId_list)
      .then((treeJson) => {
        expect(treeJson).to.be.ok;
        const { _version, configuration, trees } = parse(treeJson);
        expect(trees).to.be.ok;
        expect(_version).to.be.ok;
        expect(configuration).to.be.deep.equal(CONFIGURATION_1);
        const TIME_LAG = 1000;
        return client.getGroupDecisionTree(agentId_list, { t: CONFIGURATION_1_OPERATIONS_1_TO - TIME_LAG })
          .then((treeJson2) => {
            expect(treeJson2).to.be.ok;
            const { _version, configuration, trees } = parse(treeJson2);
            expect(trees).to.be.ok;
            expect(_version).to.be.ok;
            expect(configuration).to.be.deep.equal(CONFIGURATION_1);
            expect(treeJson).not.to.be.deep.equal(treeJson2);
          });
      });
  });

  it('Throw an error when a configuration is passed with the wrong context', () => {
    const CONFIGURATION_GROUP = _.cloneDeep(CONFIGURATION_1);
    CONFIGURATION_GROUP.context.lightIntensity.type = 'enum';
    return client.getGroupDecisionTree(agentId_list, { configuration: CONFIGURATION_GROUP })
      .then(() => Promise.reject(new Error('Should not be reached')))
      .catch((err) => expect(err).to.be.instanceof(errors.CraftAiBadRequestError));
  });

  it('Success when a good configuration is passed', () => {
    const CONFIGURATION_GROUP = _.cloneDeep(CONFIGURATION_1);
    CONFIGURATION_GROUP.learning_period = 150;
    return client.getGroupDecisionTree(agentId_list, { configuration: CONFIGURATION_GROUP })
      .then((treeJson) => {
        expect(treeJson).to.be.ok;
        const { _version, configuration, trees } = parse(treeJson);
        expect(trees).to.be.ok;
        expect(_version).to.be.ok;
        expect(configuration).to.be.deep.equal(CONFIGURATION_GROUP);
      });
  });
});
