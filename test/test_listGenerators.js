import CONFIGURATION_AGENT from './data/configuration_1.json';
import CONFIGURATION_GENERATOR from './data/configuration_1_generator.json';

import craftai from '../src';

describe('client.listGenerators()', function() {
  let client;
  const GENERATORS_ID = [`list_generators_${RUN_ID}_1`, `list_generators_${RUN_ID}_2`, `list_generators_${RUN_ID}_3`];
  const AGENT_ID = `testAgentListGenerators${RUN_ID}`;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.createAgent(CONFIGURATION_AGENT, AGENT_ID);
  });

  beforeEach(function() {
    return Promise.all(_.map(GENERATORS_ID, (generatorId) => client.deleteGenerator(generatorId))) // Delete any preexisting generator with this id.
      .then(() => Promise.all(_.map(GENERATORS_ID, (generatorId) => client.createGenerator(CONFIGURATION_GENERATOR, [AGENT_ID], generatorId))));
  });

  afterEach(function() {
    return Promise.all(
      _.map(GENERATORS_ID, (generatorId) => client.deleteGenerator(generatorId)),
      client.deleteAgent(AGENT_ID)
    );
  });

  it('should retrieve the created generators', function() {
    return client.listGenerators()
      .then((retrievedGeneratorIds) => {
        expect(retrievedGeneratorIds).to.include(GENERATORS_ID[0]);
        expect(retrievedGeneratorIds).to.include(GENERATORS_ID[1]);
        expect(retrievedGeneratorIds).to.include(GENERATORS_ID[2]);
      });
  });
});
