import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_GENERATOR from './data/configuration_1_generator.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import parse from '../src/parse';
import craftai, { errors } from '../src';

describe('client.getGeneratorDecisionTree(<agentId>, <timestamp>)', function() {
  let client;
  let agent;
  const AGENT_NAME = `get_generator_decision_${RUN_ID}`;
  const GENERATOR_NAME = `generator_${RUN_ID}`;
  const CONFIGURATION_1_OPERATIONS_1_TO = _.last(CONFIGURATION_1_OPERATIONS_1).timestamp;
  const VALID_FILTER = [AGENT_NAME];
  let CONFIGURATION_1_GENRATOR_IN_DB = _.cloneDeep(CONFIGURATION_1_GENERATOR);
  CONFIGURATION_1_GENRATOR_IN_DB.filter = VALID_FILTER;
  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.deleteAgent(AGENT_NAME)
      .then((res) => { 
        return client.createAgent(CONFIGURATION_1, AGENT_NAME);
      })
      .then((createdAgent) => {
        expect(createdAgent).to.be.ok;
        agent = createdAgent;
        return client.addAgentContextOperations(agent.id, CONFIGURATION_1_OPERATIONS_1);
      }); // Delete any preexisting agent with this id.
  });

  beforeEach(function() {
    return client.deleteGenerator(GENERATOR_NAME)
      .then(() => client.createGenerator(CONFIGURATION_1_GENERATOR, VALID_FILTER, GENERATOR_NAME));
  });

  afterEach(() => client.deleteGenerator(GENERATOR_NAME));

  it('Success on valid parameters', () => {
    return client.getGeneratorTree(GENERATOR_NAME, CONFIGURATION_1_OPERATIONS_1_TO)
      .then((treeJson) => {
        expect(treeJson).to.be.ok;
        const { _version, configuration, trees } = parse(treeJson);
        expect(trees).to.be.ok;
        expect(_version).to.be.ok;
        expect(configuration).to.be.deep.equal(CONFIGURATION_1_GENRATOR_IN_DB);
      });
  });

  it('Success when an other version is passed', () => {
    const VERSION = '1';
    return client.getGeneratorTree(GENERATOR_NAME, CONFIGURATION_1_OPERATIONS_1_TO, VERSION)
      .then((treeJson) => {
        expect(treeJson).to.be.ok;
        const { _version, configuration, trees } = parse(treeJson);
        expect(trees).to.be.ok;
        expect(_version).to.be.ok;
        expect(configuration).to.be.deep.equal(CONFIGURATION_1_GENRATOR_IN_DB);
      });
  });

  it('Should succeed without a timestamp given', () => {
    return client.getGeneratorTree(GENERATOR_NAME)
      .then((treeJson) => {
        expect(treeJson).to.be.ok;
        const { _version, configuration, trees } = parse(treeJson);
        expect(trees).to.be.ok;
        expect(_version).to.be.ok;
        expect(configuration).to.be.deep.equal(CONFIGURATION_1_GENRATOR_IN_DB);
      });
  });

  it('Should fail when an invalid timestamp is given', () => {
    const INVALID_TIMESTAMP = -124;
    return client.getGeneratorTree(GENERATOR_NAME, INVALID_TIMESTAMP)
      .then(() => Promise.reject(new Error('Should not be reached')))
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });
});
