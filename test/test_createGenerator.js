import CONFIGURATION_1 from './data/configuration_1_generator.json';
import INVALID_CONFIGURATION_1 from './data/invalid_configuration_1.json';
import craftai, { errors } from '../src';

describe('client.createGenerator(<configuration>, [id])', function() {
  let client;

  const VALID_FILTER = ['agent_1', 'agent_2'];
  const VALID_GENERATOR_NAME = 'generator_1';
  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });

  it('should work with a configuration and valid generator name provided', () => {
    return client.createGenerator(CONFIGURATION_1, VALID_FILTER, VALID_GENERATOR_NAME)
      .then((generator) => {
        expect(generator).to.be.ok;
        expect(generator.generatorId).to.be.equal(VALID_GENERATOR_NAME);
        return client.deleteGenerator(VALID_GENERATOR_NAME);
      })
      .catch((err) => {
        client.deleteAgent(VALID_GENERATOR_NAME) // The test might fail due to duplicate id, let's make sure it doesn't fail twice.
          .then(() => {
            throw err;
          });
      });
  });

  it('should not work when asked twice', () => {
    return client.createGenerator(CONFIGURATION_1, VALID_FILTER, VALID_GENERATOR_NAME)
      .then((generator) => {
        expect(generator).to.be.ok;
        expect(generator.generatorId).to.be.equal(VALID_GENERATOR_NAME);
        return client.createGenerator(VALID_GENERATOR_NAME);
      })
      .then((res) => {
        return Promise.reject(new Error(`Should not be reached but as the result : ${res}`));
      })
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
        return client.deleteGenerator(VALID_GENERATOR_NAME);
      })
      .catch((err) => {
        client.deleteAgent(VALID_GENERATOR_NAME) // The test might fail due to duplicate id, let's make sure it doesn't fail twice.
          .then(() => {
            throw err;
          });
      });
  });

  it('should fail when created with an invalid generator name', () => {
    const INVALID_GENERATOR_NAME = 'generator_1/re';
    return client.createGenerator(CONFIGURATION_1, VALID_FILTER, INVALID_GENERATOR_NAME)
      .then((res) => 
        Promise.reject(new Error(`Should not be reached but as the result : ${res}`))
      )
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });

  it('should fail when created with an undefined generator name', () => {
    const UNDEFINED_GENERATOR_NAME = undefined;
    return client.createGenerator(CONFIGURATION_1, CONFIGURATION_1, UNDEFINED_GENERATOR_NAME)
      .then((res) => 
        Promise.reject(new Error(`Should not be reached but as the result : ${res}`))
      )
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });

  it('should fail when created with an invalid filter ', () => {
    const INVALID_FILTER = ['agent_/re'];
    return client.createGenerator(CONFIGURATION_1, INVALID_FILTER, VALID_GENERATOR_NAME)
      .then((res) => 
        Promise.reject(new Error(`Should not be reached but as the result : ${res}`))
      )
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });

  it('should fail when created with an undefined filter', () => {
    const UNDEFINED_FILTER = undefined;
    return client.createGenerator(CONFIGURATION_1, UNDEFINED_FILTER, VALID_GENERATOR_NAME)
      .then((res) => 
        Promise.reject(new Error(`Should not be reached but as the result : ${res}`))
      )
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });

  it('should fail with an undefined configuration', () => {
    const UNDEFINED_CONFIGURATION = undefined;
    return client.createGenerator(UNDEFINED_CONFIGURATION, VALID_FILTER, VALID_GENERATOR_NAME)
      .then((res) => 
        Promise.reject(new Error(`Should not be reached but as the result : ${res}`))
      )
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });

  it('should fail with an invalid configuration', () => {
    return client.createGenerator(INVALID_CONFIGURATION_1, VALID_FILTER, VALID_GENERATOR_NAME)
      .then((res) => 
        Promise.reject(new Error(`Should not be reached but as the result : ${res}`))
      )
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });
});
