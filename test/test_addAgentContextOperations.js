import craftai, { errors, Time } from '../src';

import MODEL_1 from './data/model_1.json';
import MODEL_1_OPERATIONS_1 from './data/model_1_operations_1.json';

const MODEL_1_OPERATIONS_1_FROM = _.first(MODEL_1_OPERATIONS_1).timestamp;
const MODEL_1_OPERATIONS_1_TO = _.last(MODEL_1_OPERATIONS_1).timestamp;
const MODEL_1_OPERATIONS_1_LAST = _.reduce(
  MODEL_1_OPERATIONS_1,
  (context, operation) => _.extend(context, operation),
  {});

import MODEL_1_OPERATIONS_2 from './data/model_1_operations_2.json';

describe('client.addAgentContextOperations(<agentId>, <operations>)', function() {
  let client;
  let agent;
  const agentId = 'add_agent_context_operations_agent';
  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });
  beforeEach(function() {
    return client.destroyAgent(agentId) // Destroy any preexisting agent with this id.
      .then(() => client.createAgent(MODEL_1, agentId))
      .then(createdAgent => {
        expect(createdAgent).to.be.ok;
        agent = createdAgent;
      });
  });
  afterEach(function() {
    return client.destroyAgent(agentId);
  });
  it('should succeed when using valid operations', function() {
    return client.addAgentContextOperations(agent.id, MODEL_1_OPERATIONS_1)
      .then(() => {
        return client.getAgentContext(agent.id, MODEL_1_OPERATIONS_1_TO + 100);
      })
      .then(context => {
        expect(context.context).to.be.deep.equal(MODEL_1_OPERATIONS_1_LAST.diff);
        expect(context.timestamp).to.equal(MODEL_1_OPERATIONS_1_LAST.timestamp);
      })
      .then(() => {
        return client.getAgentContextOperations(agent.id);
      })
      .then(retrievedOperations => {
        expect(retrievedOperations).to.be.deep.equal(MODEL_1_OPERATIONS_1);
        return client.getAgent(agent.id);
      })
      .then(retrievedAgent => {
        expect(retrievedAgent.firstTimestamp).to.be.equal(MODEL_1_OPERATIONS_1_FROM);
        expect(retrievedAgent.lastTimestamp).to.be.equal(MODEL_1_OPERATIONS_1_TO);
      });
  });
  it('should succeed when passing unordered diffs', function() {
    return client.addAgentContextOperations(agent.id, 
      [
        {
          'timestamp': 1464600000,
          'diff': {
            'presence': 'robert',
            'lightIntensity': 0.4,
            'lightbulbColor': 'green'
          }
        },
        {
          'timestamp': 1464601500,
          'diff': {
            'presence': 'robert',
            'lightIntensity': 0.6,
            'lightbulbColor': 'green'
          }
        },
        {
          'timestamp': 1464601000,
          'diff': {
            'presence': 'gisele',
            'lightIntensity': 0.4,
            'lightbulbColor': 'blue'
          }
        },
        {
          'timestamp': 1464600500,
          'diff': {
            'presence': 'none',
            'lightIntensity': 0,
            'lightbulbColor': 'black'
          }
        }          
      ]
    )
    .then(() => {
      return client.getAgentContextOperations(agent.id);
    })
    .then(retrievedOperations => {
      expect(retrievedOperations).to.be.deep.equal(MODEL_1_OPERATIONS_1);
      return client.getAgent(agent.id);
    })
    .then(retrievedAgent => {
      expect(retrievedAgent.firstTimestamp).to.be.equal(MODEL_1_OPERATIONS_1_FROM);
      expect(retrievedAgent.lastTimestamp).to.be.equal(MODEL_1_OPERATIONS_1_TO);
    });
  });
  it('should succeed when using operations with ISO 8601 timestamps', function() {
    return client.addAgentContextOperations(agent.id, [
      {
        timestamp: '1998-04-23T04:30:00-05:00',
        diff: {
          presence: 'robert',
          lightIntensity: 0.4,
          lightbulbColor: 'green'
        }
      },
      {
        timestamp: '1998-04-23T04:32:25-05:00',
        diff: {
          presence: 'none'
        }
      }
    ])
      .then(() => {
        return client.getAgentContextOperations(agent.id);
      })
      .then(operations => {
        expect(operations).to.be.deep.equal([
          {
            timestamp: 893323800,
            diff: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            }
          },
          {
            timestamp: 893323945,
            diff: {
              presence: 'none'
            }
          }
        ]);
      });
  });
  it('should succeed when using operations with Time timestamps', function() {
    return client.addAgentContextOperations(agent.id, [
      {
        timestamp: new Time('1998-04-23T04:30:00-05:00'),
        diff: {
          presence: 'robert',
          lightIntensity: 0.4,
          lightbulbColor: 'green'
        }
      },
      {
        timestamp: Time('1998-04-23T04:32:25-05:00'),
        diff: {
          presence: 'none'
        }
      }
    ])
      .then(() => {
        return client.getAgentContextOperations(agent.id);
      })
      .then(operations => {
        expect(operations).to.be.deep.equal([
          {
            timestamp: 893323800,
            diff: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            }
          },
          {
            timestamp: 893323945,
            diff: {
              presence: 'none'
            }
          }
        ]);
      });
  });
  it('should fail when using out of order operations with immediate flush)', function() {
    return client.addAgentContextOperations(agent.id, MODEL_1_OPERATIONS_1, true)
      .then(() => {
        return client.addAgentContextOperations(agent.id, MODEL_1_OPERATIONS_1[0], true);
      })
      .catch(err => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      })
      .then(() => {
        return client.getAgentContextOperations(agent.id);
      })
      .then(retrievedOperations => {
        expect(retrievedOperations).to.be.deep.equal(MODEL_1_OPERATIONS_1);
      });
  });
  it('should fail later when using out of order operations', function() {
    return client.addAgentContextOperations(agent.id, MODEL_1_OPERATIONS_1)
      .then(() => {
        return client.getAgentContextOperations(agent.id);
      })
      .then(retrievedOperations => {
        expect(retrievedOperations).to.be.deep.equal(MODEL_1_OPERATIONS_1);
      })
      .then(() => {
        return client.addAgentContextOperations(agent.id, MODEL_1_OPERATIONS_1[0]);
      })
      .then(() => {
        return client.getAgentContextOperations(agent.id);
      })
      .catch(err => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      })
      .then(() => {
        return client.getAgentContextOperations(agent.id);
      })
      .then(retrievedOperations => {
        expect(retrievedOperations).to.be.deep.equal(MODEL_1_OPERATIONS_1);
      });
  });
  it('should succeed with a very large number of simultaneous calls', function() {
    this.timeout(10000);
    return Promise.all(
      _(MODEL_1_OPERATIONS_2)
        .chunk(5)
        .map(operationsChunk => client.addAgentContextOperations(agent.id, operationsChunk))
        .value()
      )
      .then(() => {
        return client.getAgentContextOperations(agent.id);
      })
      .then(retrievedOperations => {
        expect(retrievedOperations).to.be.deep.equal(MODEL_1_OPERATIONS_2);
      });
  });
  it('should succeed with a very large payload', function() {
    this.timeout(10000);
    return client.addAgentContextOperations(agent.id, MODEL_1_OPERATIONS_2)
    .then(() => {
      return client.getAgentContextOperations(agent.id);
    })
    .then(retrievedOperations => {
      expect(retrievedOperations).to.be.deep.equal(MODEL_1_OPERATIONS_2);
    });
  });
  it('should not fail when destroying the agent to which operations where added', function() {
    const agent2Id = 'add_agent_context_operations_agent_2';
    return client.destroyAgent(agent2Id) // Destroy any preexisting agent with this id.
      .then(() => client.createAgent(MODEL_1, agent2Id))
      .then(() => client.addAgentContextOperations(agent2Id, MODEL_1_OPERATIONS_1))
      .then(() => client.destroyAgent(agent2Id))
      .then(() => client.getAgentContextOperations(agent.id))
      .then(retrievedOperations => {
        expect(retrievedOperations).to.be.deep.empty;
      });
  });
});
