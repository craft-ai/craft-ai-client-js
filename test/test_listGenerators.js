import CONFIGURATION_AGENT from './data/configuration_1.json';
import CONFIGURATION_GENERATOR from './data/configuration_1_generator.json';

import craftai from '../src';

describe('client.listGenerators()', function() {
  let client;
  const GENERATORS_ID = [`list_generators_${RUN_ID}_1`, `list_generators_${RUN_ID}_2`, `list_generators_${RUN_ID}_3`];
  const AGENT_ID = `testAgentListGenerators${RUN_ID}`;
  const CONFIGURATION_GET_GENERATOR_LIST = JSON.parse(JSON.stringify(CONFIGURATION_GENERATOR));
  CONFIGURATION_GET_GENERATOR_LIST.filter = [AGENT_ID];

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.deleteAgent(AGENT_ID)
      .then(() => Promise.all(GENERATORS_ID.map((generatorId) => client.deleteGenerator(generatorId)))) // Delete any preexisting generator with this id.)
      .then((res) => client.createAgent(CONFIGURATION_AGENT, AGENT_ID))
      .then(() => Promise.all(_.map(GENERATORS_ID, (generatorId) => client.createGenerator(CONFIGURATION_GENERATOR, generatorId))));
  });

  after(function() {
    return Promise.all(_.map(GENERATORS_ID, (generatorId) => client.deleteGenerator(generatorId)))
      .then(() => client.deleteAgent(AGENT_ID));
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
