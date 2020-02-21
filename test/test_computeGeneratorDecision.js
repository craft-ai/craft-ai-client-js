import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_GENERATOR from './data/configuration_1_generator.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_3.json';
import craftai, { errors } from '../src';

const CONFIGURATION_1_OPERATIONS_1_TO = _.last(CONFIGURATION_1_OPERATIONS_1).timestamp;

describe('client.computeGeneratorDecision(<generatorId>, <timestamp>, <context>)', function() {
  let client;
  const AGENT_NAME = `compute_gen_dec_${RUN_ID}`;
  const GENERATOR_NAME = `compute_gen_dec_gen_${RUN_ID}`;
  const VALID_FILTER = [AGENT_NAME];
  const CONFIGURATION = JSON.parse(JSON.stringify(CONFIGURATION_1_GENERATOR));
  CONFIGURATION.filter = VALID_FILTER;
  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.deleteAgent(AGENT_NAME)
      .then(() => client.deleteGenerator(GENERATOR_NAME))
      .then(() => client.createAgent(CONFIGURATION_1, AGENT_NAME))
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        return client.addAgentContextOperations(AGENT_NAME, CONFIGURATION_1_OPERATIONS_1);
      })
      .then(() => client.createGenerator(CONFIGURATION, GENERATOR_NAME));
  });

  after(function() {
    return client.deleteAgent(AGENT_NAME)
      .then(() => client.deleteGenerator(GENERATOR_NAME));
  });

  it('should succeed when using valid parameters', function() {
    return client.computeGeneratorDecision(GENERATOR_NAME, CONFIGURATION_1_OPERATIONS_1_TO, {
      presence: 'none',
      lightIntensity: 0.1
    })
      .then((decision) => {
        expect(decision).to.be.ok;
        expect(decision.output.lightbulbColor.predicted_value).to.be.equal('black');
      });
  });

  it('should succeed when using valid parameters (context override)', function() {
    return client.computeGeneratorDecision(GENERATOR_NAME, CONFIGURATION_1_OPERATIONS_1_TO, {
      presence: 'none',
      lightIntensity: 1
    }, {
      presence: 'robert'
    })
      .then((decision) => {
        expect(decision).to.be.ok;
        expect(decision.output.lightbulbColor.predicted_value).to.be.equal('green');
      });
  });

  it('should fail when using invalid generator name', function() {
    const INVALID_GENERATOR_NAME = 'a//';
    return client.computeGeneratorDecision(INVALID_GENERATOR_NAME, CONFIGURATION_1_OPERATIONS_1_TO, {
      presence: 'none',
      lightIntensity: 0.1
    })
      .then((res) =>
        Promise.reject(new Error(`Should not be reached but as the result : ${res}`))
      )
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });

  it('should fail when using no context', function() {
    return client.computeGeneratorDecision(GENERATOR_NAME, CONFIGURATION_1_OPERATIONS_1_TO, undefined)
      .then((res) =>
        Promise.reject(new Error(`Should not be reached but as the result : ${res}`))
      )
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });

  it('should fail when using invalid timestamp', function() {
    const INVALID_TIMESTAMP = 'a//';
    return client.computeGeneratorDecision(GENERATOR_NAME, INVALID_TIMESTAMP, {
      presence: 'none',
      lightIntensity: 0.1
    })
      .then((res) =>
        Promise.reject(new Error(`Should not be reached but as the result : ${res}`))
      )
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiTimeError);
      });
  });
});
