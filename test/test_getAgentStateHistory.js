import craftai from '../src';

import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';

describe('client.getAgentStateHistory(<agentId>)', function() {
  let client;
  const agentId = `getAgentStateHistory_${RUN_ID}`;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.deleteAgent(agentId) // Delete any preexisting agent with this id.
      .then(() => client.createAgent(CONFIGURATION_1, agentId))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        return client.addAgentContextOperations(agentId, CONFIGURATION_1_OPERATIONS_1);
      });
  });

  after(function() {
    return client.deleteAgent(agentId);
  });

  it('should retrieve all state history', function() {
    return client.getAgentStateHistory(agentId)
      .then((stateHistory) => {
        expect(stateHistory.length).to.be.equal(16);
        expect(stateHistory).to.be.deep.equal([
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600000
          },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600100 },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600200
          },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600300
          },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600400
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600500
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600600
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600700
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600800
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600900
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601000
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601100
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601200
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601300
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601400
          },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.6,
              lightbulbColor: 'green'
            },
            timestamp: 1464601500
          }
        ]);
      });
  });

  it('should only retrieve the state after the given lower bound', function() {
    const lowerBound = 1464600867;
    return client.getAgentStateHistory(agentId, lowerBound)
      .then((stateHistory) => {
        expect(stateHistory).to.be.deep.equal([
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600900
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601000
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601100
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601200
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601300
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601400
          },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.6,
              lightbulbColor: 'green'
            },
            timestamp: 1464601500
          }
        ]);
      });
  });

  it('should only retrieve the state before the given upper bound', function() {
    const upperBound = 1464601439;
    return client.getAgentStateHistory(agentId, undefined, upperBound)
      .then((stateHistory) => {
        expect(stateHistory).to.be.deep.equal([
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600000
          },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600100 },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600200
          },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600300
          },
          {
            sample: {
              presence: 'robert',
              lightIntensity: 0.4,
              lightbulbColor: 'green'
            },
            timestamp: 1464600400
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600500
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600600
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600700
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600800
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600900
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601000
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601100
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601200
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601300
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601400
          }
        ]);
      });
  });

  it('should only retrieve the state between the desired bounds', function() {
    const lowerBound = 1464600449;
    const upperBound = 1464601124;
    return client.getAgentStateHistory(agentId, lowerBound, upperBound)
      .then((stateHistory) => {
        expect(stateHistory).to.be.deep.equal([
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600500
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600600
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600700
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600800
          },
          {
            sample: {
              presence: 'none',
              lightIntensity: 0,
              lightbulbColor: 'black'
            },
            timestamp: 1464600900
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601000
          },
          {
            sample: {
              presence: 'gisele',
              lightIntensity: 0.4,
              lightbulbColor: 'blue'
            },
            timestamp: 1464601100
          }
        ]);
      });
  });
});
