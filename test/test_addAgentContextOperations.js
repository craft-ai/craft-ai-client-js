import CONFIGURATION_1 from './data/configuration_1.json';

import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import CONFIGURATION_1_OPERATIONS_2 from './data/configuration_1_operations_2.json';
import EXPECTED_CONFIGURATION_1_OPERATIONS_1 from './data/expected/configuration_1_operations_1.json';
import EXPECTED_CONFIGURATION_1_OPERATIONS_2 from './data/expected/configuration_1_operations_2.json';

const CONFIGURATION_1_OPERATIONS_1_FROM = _.first(CONFIGURATION_1_OPERATIONS_1).timestamp;
const CONFIGURATION_1_OPERATIONS_1_TO = _.last(CONFIGURATION_1_OPERATIONS_1).timestamp;
const CONFIGURATION_1_OPERATIONS_1_LAST = _.reduce(
  CONFIGURATION_1_OPERATIONS_1,
  (context, operation) => _.extend(context, operation),
  {});

import craftai, { errors, Time } from '../src';

import '../src/polyfill';

describe('client.addAgentContextOperations(<agentId>, <operations>)', function() {
  let client;
  let agents;
  const agentsId = [`addAgentContextOps_${RUN_ID}_1`, `addAgentContextOps_${RUN_ID}_2`];

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    expect(CONFIGURATION_1_OPERATIONS_2).to.have.lengthOf(3260);
  });

  beforeEach(function() {
    // Delete any preexisting agent with this id.
    return Promise.all(_.map(agentsId, (agentId) => client.deleteAgent(agentId)
      .then(() => client.createAgent(CONFIGURATION_1, agentId))
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
    return Promise.allSettled(agents.map((agent) => client.deleteAgent(agent.id)));
  });

  it('should succeed when using valid operations', function() {
    return client.addAgentContextOperations(agents[0].id, CONFIGURATION_1_OPERATIONS_1)
      .then((response) => {
        expect(response.nbOperationsAdded).to.equal(4);
        return client.getAgentContext(agents[0].id, CONFIGURATION_1_OPERATIONS_1_TO + 100);
      })
      .then((context) => {
        expect(context.context).to.be.deep.equal(CONFIGURATION_1_OPERATIONS_1_LAST.context);
        expect(context.timestamp).to.equal(CONFIGURATION_1_OPERATIONS_1_TO);
      })
      .then(() => {
        return client.getAgentContextOperations(agents[0].id);
      })
      .then((retrievedOperations) => {
        expect(retrievedOperations).to.be.deep.equal(CONFIGURATION_1_OPERATIONS_1);
        return client.getAgent(agents[0].id);
      })
      .then((retrievedAgent) => {
        expect(retrievedAgent.firstTimestamp).to.be.equal(CONFIGURATION_1_OPERATIONS_1_FROM);
        expect(retrievedAgent.lastTimestamp).to.be.equal(CONFIGURATION_1_OPERATIONS_1_TO);
      });
  });
  it('should succeed when passing unordered contexts', function() {
    return client.addAgentContextOperations(agents[0].id,
      [
        {
          'timestamp': 1464600000,
          'context': {
            'presence': 'robert',
            'lightIntensity': 0.4,
            'lightbulbColor': 'green'
          }
        },
        {
          'timestamp': 1464601500,
          'context': {
            'presence': 'robert',
            'lightIntensity': 0.6,
            'lightbulbColor': 'green'
          }
        },
        {
          'timestamp': 1464601000,
          'context': {
            'presence': 'gisele',
            'lightIntensity': 0.4,
            'lightbulbColor': 'blue'
          }
        },
        {
          'timestamp': 1464600500,
          'context': {
            'presence': 'none',
            'lightIntensity': 0,
            'lightbulbColor': 'black'
          }
        }
      ]
    )
      .then((response) => {
        expect(response.nbOperationsAdded).to.equal(4);
        return client.getAgentContextOperations(agents[0].id);
      })
      .then((retrievedOperations) => {
        expect(retrievedOperations).to.be.deep.equal(CONFIGURATION_1_OPERATIONS_1);
        return client.getAgent(agents[0].id);
      })
      .then((retrievedAgent) => {
        expect(retrievedAgent.firstTimestamp).to.be.equal(CONFIGURATION_1_OPERATIONS_1_FROM);
        expect(retrievedAgent.lastTimestamp).to.be.equal(CONFIGURATION_1_OPERATIONS_1_TO);
      });
  });
  it('should succeed when using operations with ISO 8601 timestamps', function() {
    this.timeout(100000); // TODO: To be removed.
    return client.addAgentContextOperations(agents[0].id, [
      {
        timestamp: '2020-04-23T04:30:00-05:00',
        context: {
          presence: 'robert',
          lightIntensity: 0.4,
          lightbulbColor: 'green'
        }
      },
      {
        timestamp: '2020-04-23T04:32:25-05:00',
        context: {
          presence: 'none'
        }
      }
    ])
      .then((response) => {
        expect(response.nbOperationsAdded).to.equal(2);
        return client.getAgentContextOperations(agents[0].id);
      })
      .then((operations) => {
        expect(operations).to.be.deep.equal([
          {
            timestamp: 1587634200,
            context: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            }
          },
          {
            timestamp: 1587634345,
            context: {
              presence: 'none',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            }
          }
        ]);
      });
  });
  it('should succeed when using operations with Time timestamps', function() {
    return client.addAgentContextOperations(agents[0].id, [
      {
        timestamp: new Time('1998-04-23T04:30:00-05:00'),
        context: {
          presence: 'robert',
          lightIntensity: 0.4,
          lightbulbColor: 'green'
        }
      },
      {
        timestamp: Time('1998-04-23T04:32:25-05:00'),
        context: {
          presence: 'none'
        }
      }
    ])
      .then((response) => {
        expect(response.nbOperationsAdded).to.equal(2);
        return client.getAgentContextOperations(agents[0].id);
      })
      .then((operations) => {
        expect(operations).to.be.deep.equal([
          {
            timestamp: 893323800,
            context: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            }
          },
          {
            timestamp: 893323945,
            context: {
              presence: 'none',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            }
          }
        ]);
      });
  });
  it('should succeed when sending invalid operations or no operation at all', function() {
    return client.addAgentContextOperations(agents[0].id, CONFIGURATION_1_OPERATIONS_1)
      .then(() => client.addAgentContextOperations(agents[0].id, []))
      .then(() => client.addAgentContextOperations(agents[0].id, undefined))
      .then(() => client.addAgentContextOperations(agents[0].id, [undefined, undefined]))
      .then(() => client.getAgentContextOperations(agents[0].id))
      .then((retrievedOperations) => {
        expect(retrievedOperations).to.be.deep.equal(CONFIGURATION_1_OPERATIONS_1);
      });
  });
  it('should fail when using out-of-order operations', function() {
    return client.addAgentContextOperations(agents[0].id, CONFIGURATION_1_OPERATIONS_1)
      .then(() => client.getAgentContextOperations(agents[0].id))
      .then((retrievedOperations) => expect(retrievedOperations).to.be.deep.equal(CONFIGURATION_1_OPERATIONS_1))
      .then(() => client.addAgentContextOperations(agents[0].id, CONFIGURATION_1_OPERATIONS_1[0]))
      .then(
        () => Promise.reject(new Error('Should not be reached')),
        (err) => {
          expect(err).to.be.an.instanceof(errors.CraftAiError);
          expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
        }
      );
  });
  it('should succeed with a very large payload', function() {
    this.timeout(100000); // TODO: To be removed.
    return client.addAgentContextOperations(agents[0].id, CONFIGURATION_1_OPERATIONS_2)
      .then(() => client.getAgentContextOperations(agents[0].id))
      .then((retrievedOperations) => {
        expect(retrievedOperations.length).to.be.equal(CONFIGURATION_1_OPERATIONS_2.length);
        expect(retrievedOperations).to.be.deep.equal(EXPECTED_CONFIGURATION_1_OPERATIONS_2);
      });
  });
  it('should not fail when deleting the agent to which operations where added', function() {
    return client.addAgentContextOperations(agents[1].id, CONFIGURATION_1_OPERATIONS_1)
      .then(() => client.deleteAgent(agents[1].id))
      .then(() => client.getAgentContextOperations(agents[0].id))
      .then((retrievedOperations) => {
        expect(retrievedOperations).to.be.deep.empty;
      });
  });
  it('should work properly when sending operations to more than one agent', function() {
    this.timeout(100000); // TODO: To be removed.
    return Promise.all([
      client.addAgentContextOperations(agents[0].id, CONFIGURATION_1_OPERATIONS_2),
      client.addAgentContextOperations(agents[1].id, CONFIGURATION_1_OPERATIONS_1)
    ])
      .then(() => client.getAgentContextOperations(agents[0].id))
      .then((retrievedOperations) => {
        expect(retrievedOperations.length).to.be.equal(CONFIGURATION_1_OPERATIONS_2.length);
        expect(retrievedOperations).to.be.deep.equal(EXPECTED_CONFIGURATION_1_OPERATIONS_2);
      })
      .then(() => client.getAgentContextOperations(agents[1].id))
      .then((retrievedOperations) => {
        expect(retrievedOperations).to.be.deep.equal(EXPECTED_CONFIGURATION_1_OPERATIONS_1);
      });
  });
});
