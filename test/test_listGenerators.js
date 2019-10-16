import CONFIGURATION_AGENT from './data/configuration_1.json';
import CONFIGURATION_GENERATOR from './data/configuration_1_generator.json';

import craftai from '../src';

describe('client.listGenerators()', function() {
  let client;
  const generatorsId = [`list_generators_${RUN_ID}_1`, `list_generators_${RUN_ID}_2`, `list_generators_${RUN_ID}_3`];
  const agentId = `testAgentListGenerators${RUN_ID}`;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.createAgent(CONFIGURATION_AGENT, agentId);
  });

  beforeEach(function() {
    return Promise.all(_.map(generatorsId, (generatorId) => client.deleteGenerator(generatorId))) // Delete any preexisting generator with this id.
      .then(() => Promise.all(_.map(generatorsId, (generatorId) => client.createGenerator(CONFIGURATION_GENERATOR,[agentId], generatorId))));
  });

  afterEach(function() {
    return Promise.all(
      _.map(generatorsId, (generatorId) => client.deleteGenerator(generatorId)),
      client.deleteAgent(agentId)
    );
  });

  it('should retrieve the created generators', function() {
    return client.listGenerators()
      .then((retrievedGeneratorIds) => {
        expect(retrievedGeneratorIds).to.include(generatorsId[0]);
        expect(retrievedGeneratorIds).to.include(generatorsId[1]);
        expect(retrievedGeneratorIds).to.include(generatorsId[2]);
      });
  });
});
