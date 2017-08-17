import craftai from '../src';

import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_OPERATIONS_2 from './data/configuration_1_operations_2.json';

describe('client.getAgentContextOperations(<agentId>)', function() {
  let client;
  const agentId = `getAgentContextOps_${RUN_ID}`;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.deleteAgent(agentId) // Delete any preexisting agent with this id.
      .then(() => client.createAgent(CONFIGURATION_1, agentId))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        return client.addAgentContextOperations(agentId, CONFIGURATION_1_OPERATIONS_2);
      });
  });

  after(function() {
    return client.deleteAgent(agentId);
  });

  it('should retrieve all context operations', function() {
    return client.getAgentContextOperations(agentId)
      .then((operations) => {
        expect(_.first(operations)).to.be.deep.equal(_.first(CONFIGURATION_1_OPERATIONS_2));
        expect(_.last(operations)).to.be.deep.equal(_.last(CONFIGURATION_1_OPERATIONS_2));
        expect(operations).to.be.deep.equal(CONFIGURATION_1_OPERATIONS_2);
      });
  });
  it('should only retrieve the operations after the given lower bound', function() {
    const lowerBound = 1464356844;
    return client.getAgentContextOperations(agentId, lowerBound)
      .then((operations) => {
        const expectedOperations = _.filter(CONFIGURATION_1_OPERATIONS_2, ({ timestamp }) => timestamp >= lowerBound);
        expect(operations).to.be.deep.equal(expectedOperations);
      });
  });

  it('should only retrieve the operations before the given upper bound', function() {
    const upperBound = 1462824549;
    return client.getAgentContextOperations(agentId, undefined, upperBound)
      .then((operations) => {
        const expectedOperations = _.filter(CONFIGURATION_1_OPERATIONS_2, ({ timestamp }) => timestamp <= upperBound);
        expect(operations).to.be.deep.equal(expectedOperations);
      });
  });

  it('should retrieve no operations between the desired bounds', function() {
    const lowerBound = 1464356844;
    const upperBound = 1462824549;
    return client.getAgentContextOperations(agentId, lowerBound, upperBound)
      .then((operations) => {
        const expectedOperations = _.filter(CONFIGURATION_1_OPERATIONS_2, ({ timestamp }) => timestamp >= lowerBound && timestamp <= upperBound);
        expect(operations).to.be.deep.equal(expectedOperations);
      });
  });

  it('should only retrieve the operations between the desired bounds', function() {
    const lowerBound = 1462824549;
    const upperBound = 1464356844;
    return client.getAgentContextOperations(agentId, lowerBound, upperBound)
      .then((operations) => {
        const expectedOperations = _.filter(CONFIGURATION_1_OPERATIONS_2, ({ timestamp }) => timestamp >= lowerBound && timestamp <= upperBound);
        expect(operations).to.be.deep.equal(expectedOperations);
      });
  });
});
