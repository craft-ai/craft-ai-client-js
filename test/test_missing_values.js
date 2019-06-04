import CONFIGURATION_MV from './data/configuration_mv.json';
import CONFIGURATION_MV_OPERATIONS from './data/configuration_mv_operations.json';
import craftai from '../src';
import parse from '../src/parse';
import semver from 'semver';

const CONFIGURATION_MV_OPERATIONS_FROM = _.first(CONFIGURATION_MV_OPERATIONS).timestamp;
const CONFIGURATION_MV_OPERATIONS_TO = _.last(CONFIGURATION_MV_OPERATIONS).timestamp;
const CONFIGURATION_MV_OPERATIONS_LAST = _.reduce(
  CONFIGURATION_MV_OPERATIONS,
  (context, operation) => _.extend(context, operation),
  {});

describe('client.addAgentContextOperations(<agentId>, <operations>) with missing values', function() {
  let client;
  let agents;
  const agentsId = [`addAgentContextOps_${RUN_ID}_1`, `addAgentContextOps_${RUN_ID}_2`];

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });

  beforeEach(function() {
    return Promise.all(_.map(agentsId, (agentId) => client.deleteAgent(agentId) // Delete any preexisting agent with this id.
      .then(() => client.createAgent(CONFIGURATION_MV, agentId))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        return createdAgent;
      })
    ))
      .then((createdAgents) => {
        agents = createdAgents;
      });
  });

  afterEach(function() {
    return Promise.all(_.map(agents, (agent) => client.deleteAgent(agent.id)));
  });

  it('should succeed when using operations', function() {
    return client.addAgentContextOperations(agents[0].id, CONFIGURATION_MV_OPERATIONS)
      .then(() => client.getAgentDecisionTree(agents[0].id, CONFIGURATION_MV_OPERATIONS_TO, '2'))
      .then((treeJson) => {
        expect(treeJson).to.be.ok;
        const { _version, configuration, trees } = parse(treeJson);
        expect(trees).to.be.ok;
        expect(_version).to.be.ok;
        expect(semver.major(_version)).to.be.equal(2);
        expect(configuration).to.be.deep.equal(CONFIGURATION_MV);
        return client.getAgentContext(agents[0].id, CONFIGURATION_MV_OPERATIONS_TO + 100);
      })
      .then((context) => {
        expect(context.context).to.be.deep.equal(CONFIGURATION_MV_OPERATIONS_LAST.context);
        expect(context.timestamp).to.equal(CONFIGURATION_MV_OPERATIONS_TO);
      })
      .then(() => {
        return client.getAgentContextOperations(agents[0].id);
      })
      .then((retrievedOperations) => {
        expect(retrievedOperations).to.be.deep.equal(CONFIGURATION_MV_OPERATIONS);
        return client.getAgent(agents[0].id);
      })
      .then((retrievedAgent) => {
        expect(retrievedAgent.firstTimestamp).to.be.equal(CONFIGURATION_MV_OPERATIONS_FROM);
        expect(retrievedAgent.lastTimestamp).to.be.equal(CONFIGURATION_MV_OPERATIONS_TO);
      });
  });
});
