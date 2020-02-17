import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_GENERATOR from './data/configuration_1_generator.json';

import craftai, { errors } from '../src';

describe('client.getGenerator(<generatorId>)', function() {
  let client;
  let generator;
  const AGENT_NAME = `get_generator_agent_${RUN_ID}`;
  const GENERATOR_NAME = `get_generator_agent_${RUN_ID}`;
  const VALID_FILTER =  [AGENT_NAME];
  const CONFIGURATION_GENERATOR = JSON.parse(JSON.stringify(CONFIGURATION_1_GENERATOR));
  CONFIGURATION_GENERATOR.filter = VALID_FILTER;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });

  beforeEach(function() {
    return client.deleteAgent(AGENT_NAME) // Delete any preexisting agent with this id.
      .then(() => client.createAgent(CONFIGURATION_1, AGENT_NAME))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
      })
      .then(() => client.deleteGenerator(GENERATOR_NAME)) // Delete any preexisting generator with this id.
      .then(() => client.createGenerator(CONFIGURATION_1_GENERATOR, GENERATOR_NAME))
      .then((createdGenerator) => {
        expect(createdGenerator).to.be.ok;
        generator = createdGenerator;
      });
  });

  afterEach(function() {
    return client.deleteAgent(AGENT_NAME)
      .then(() => client.deleteGenerator(GENERATOR_NAME));
  });

  it('should return no first/last timestamps on "empty" generators', function() {
    return client.getGenerator(generator.id)
      .then((retrievedGenerator) => {
        expect(retrievedGenerator.firstTimestamp).to.be.undefined;
        expect(retrievedGenerator.lastTimestamp).to.be.undefined;
      });
  });

  it('should fail on non-existing generator', function() {
    return client.deleteGenerator(GENERATOR_NAME)
      .then(() => client.getGenerator(generator.id))
      .then(
        () => Promise.reject(new Error('Should not be reached')),
        (err) => {
          expect(err).to.be.an.instanceof(errors.CraftAiError);
          expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
        }
      );
  });

  it('should fail on bad generator id', function() {
    return client.getGenerator('foo@bar/toto')
      .then(
        () => Promise.reject(new Error('Should not be reached')),
        (err) => {
          expect(err).to.be.an.instanceof(errors.CraftAiError);
          expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
        }
      );
  });
});
