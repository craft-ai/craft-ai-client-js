import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_GENERATOR from './data/configuration_1_generator.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import CONFIGURATION_1_OPERATIONS_2 from './data/configuration_1_operations_2.json';
import craftai from '../src';

describe('client.getGeneratorContextOperations(<generatorId>, from, to)', function() {
  let client;
  const agentId = `getGenCOpsAgent_${RUN_ID}`;
  const agentId2 = `getGenCOpsAgent2_${RUN_ID}`;
  const generatorId = `getGenCOpsGen_${RUN_ID}`;

  const generatorConfiguration = JSON.parse(JSON.stringify(CONFIGURATION_1_GENERATOR));
  generatorConfiguration.filter = [agentId, agentId2];

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.deleteAgent(agentId) // Delete any preexisting agent with this id.
      .then(() => client.deleteAgent(agentId2))
      .then(() => client.deleteGenerator(generatorId))
      .then(() => client.createAgent(CONFIGURATION_1, agentId))
      .then(() => client.createAgent(CONFIGURATION_1, agentId2))
      .then(() => client.createGenerator(generatorConfiguration, generatorId))
      .then(() => client.addAgentContextOperations(agentId, CONFIGURATION_1_OPERATIONS_1))
      .then(() => client.addAgentContextOperations(agentId2, CONFIGURATION_1_OPERATIONS_2));
  });

  after(function() {
    return client.deleteAgent(agentId)
      .then(() => client.deleteAgent(agentId2))
      .then(() => client.deleteGenerator(generatorId));
  });

  it('should retrieve all context operations', function() {
    return client.getGeneratorContextOperations(generatorId)
      .then((operations) => {
        expect(_.first(operations)).to.be.deep.equal({ agent_id: agentId2, context: _.first(CONFIGURATION_1_OPERATIONS_2).context, timestamp: _.first(CONFIGURATION_1_OPERATIONS_2).timestamp });
        expect(_.last(operations)).to.be.deep.equal({ agent_id: agentId2, context: _.last(CONFIGURATION_1_OPERATIONS_2).context, timestamp: _.last(CONFIGURATION_1_OPERATIONS_2).timestamp });
        expect(operations.length).to.be.equal(CONFIGURATION_1_OPERATIONS_2.length + CONFIGURATION_1_OPERATIONS_1.length);
        const formattedExpectedResult = CONFIGURATION_1_OPERATIONS_2.slice(0, 1000)
          .map((operation) => ({ agent_id: agentId2, context: operation.context, timestamp: operation.timestamp }));
        expect(operations.slice(0, 1000)).to.be.deep.equal(formattedExpectedResult);
      });
  });
  it('should only retrieve the operations after the given lower bound', function() {
    const lowerBound = 1464600406;
    return client.getGeneratorContextOperations(generatorId, lowerBound)
      .then((operations) => {
        const expectedOperations2 = _.filter(CONFIGURATION_1_OPERATIONS_2, ({ timestamp }) => timestamp >= lowerBound);
        expect(operations[0]).to.be.deep.equal({ agent_id: agentId2, context: expectedOperations2[0].context, timestamp: expectedOperations2[0].timestamp });
        expect(operations[1]).to.be.deep.equal({ agent_id: agentId, context: CONFIGURATION_1_OPERATIONS_1[1].context, timestamp: CONFIGURATION_1_OPERATIONS_1[1].timestamp });
        expect(operations[2]).to.be.deep.equal({ agent_id: agentId2, context: expectedOperations2[1].context, timestamp: expectedOperations2[1].timestamp });
        expect(operations[3]).to.be.deep.equal({ agent_id: agentId2, context: expectedOperations2[2].context, timestamp: expectedOperations2[2].timestamp });
        expect(operations.length).to.equal(expectedOperations2.length + CONFIGURATION_1_OPERATIONS_1.length - 1);
        const formattedExpectedResult = _.takeRight(expectedOperations2, 100)
          .map((operation) => ({ agent_id: agentId2, context: operation.context, timestamp: operation.timestamp }));
        expect(_.takeRight(operations, 100)).to.be.deep.equal(formattedExpectedResult);
      });
  });

  it('should only retrieve the operations before the given upper bound', function() {
    const upperBound = 1464600406;
    return client.getGeneratorContextOperations(generatorId, undefined, 1464600406)
      .then((operations) => {
        const expectedOperations2 = _.filter(CONFIGURATION_1_OPERATIONS_2, ({ timestamp }) => timestamp <= upperBound);
        expect(operations[operations.length - 1]).to.be.deep.equal({ agent_id: agentId2, context: expectedOperations2[expectedOperations2.length - 1].context, timestamp: expectedOperations2[expectedOperations2.length - 1].timestamp });
        expect(operations[operations.length - 2]).to.be.deep.equal({ agent_id: agentId2, context: expectedOperations2[expectedOperations2.length - 2].context, timestamp: expectedOperations2[expectedOperations2.length - 2].timestamp });
        expect(operations[operations.length - 3]).to.be.deep.equal({ agent_id: agentId, context: CONFIGURATION_1_OPERATIONS_1[0].context, timestamp: CONFIGURATION_1_OPERATIONS_1[0].timestamp });
        expect(operations[operations.length - 4]).to.be.deep.equal({ agent_id: agentId2, context: expectedOperations2[expectedOperations2.length - 3].context, timestamp: expectedOperations2[expectedOperations2.length - 3].timestamp });
        expect(operations.length).to.equal(expectedOperations2.length + 1);
        const formattedExpectedResult = _.take(expectedOperations2, 1000)
          .map((operation) => ({ agent_id: agentId2, context: operation.context, timestamp: operation.timestamp }));
        expect(_.take(operations, 1000)).to.be.deep.equal(formattedExpectedResult);
      });
  });

  it('should retrieve no operations between the desired bounds', function() {
    const lowerBound = 1464356844;
    const upperBound = 1462824549;
    return client.getGeneratorContextOperations(generatorId, lowerBound, upperBound)
      .then((operations) => {
        const expectedOperations = [];
        expect(operations).to.be.deep.equal(expectedOperations);
      });
  });

  it('should only retrieve the operations between the desired bounds', function() {
    const lowerBound = 1462824549;
    const upperBound = 1464356844;
    return client.getGeneratorContextOperations(generatorId, lowerBound, upperBound)
      .then((operations) => {
        const expectedOperations = _.filter(CONFIGURATION_1_OPERATIONS_2, ({ timestamp }) => timestamp >= lowerBound && timestamp <= upperBound);
        expect(operations).to.be.deep.equal(expectedOperations.map((operation) => ({ agent_id: agentId2, context: operation.context, timestamp: operation.timestamp })));
      });
  });
});
