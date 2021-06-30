import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import CONFIGURATION_1_OPERATIONS_2 from './data/configuration_1_operations_2.json';
import CONFIGURATION_BOOSTING_1 from './data/configuration_1_boosting.json';
import CONFIGURATION_BOOSTING_1_OPERATIONS_1 from './data/configuration_1_operations_3.json';
import { expect } from 'chai';
import INVALID_CONFIGURATION_1 from './data/invalid_configuration_1.json';
import INVALID_CONFIGURATION_1_OPERATIONS_1 from './data/invalid_configuration_1_operations_1.json';
import craftai, { errors } from '../src';

import '../src/polyfill';

describe('BULK:', function() {
  let client;
  const agentIds = Array.apply(null, Array(10))
    .map((x, i) => `agent_bulk_${i}_${RUN_ID}`);
  const generatorIds = Array.apply(null, Array(3))
    .map((x, i) => `generator_bulk_${i}_${RUN_ID}`);
  const CONFIGURATION_1_GENERATOR = {
    context: {
      presence: {
        type: 'enum'
      },
      lightIntensity: {
        type: 'continuous'
      },
      lightbulbColor: {
        type: 'enum'
      }
    },
    output: ['lightbulbColor'],
    time_quantum: 100,
    learning_period: 1500000,
    operations_as_events: true,
    max_training_samples: 10000,
    model_type: 'decisionTree',
    filter: [agentIds[0], agentIds[1]]
  };

  const CONFIGURATION_BOOSTING_1_OPERATIONS_1_FROM = _.first(CONFIGURATION_BOOSTING_1_OPERATIONS_1).timestamp;
  const CONFIGURATION_BOOSTING_1_OPERATIONS_1_TO = _.last(CONFIGURATION_BOOSTING_1_OPERATIONS_1).timestamp;
  const REQUESTED_TIMEWINDOW = [CONFIGURATION_BOOSTING_1_OPERATIONS_1_FROM, CONFIGURATION_BOOSTING_1_OPERATIONS_1_TO];
  const BOOSTING_CONTEXT = { presence: 'none', lightIntensity: 0.1 };
  const CONFIGURATION_BOOSTING_1_GENERATOR = {
    context: {
      presence: {
        type: 'enum'
      },
      lightIntensity: {
        type: 'continuous'
      },
      lightbulbColor: {
        type: 'enum'
      }
    },
    output: [
      'lightbulbColor'
    ],
    operations_as_events: true,
    tree_max_operations: 55000,
    min_samples_per_leaf: 4,
    num_iterations: 100,
    learning_rate: 0.1,
    model_type: 'boosting',
    filter: [agentIds[0]]
  };

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });

  beforeEach(function() {
    return client.deleteAgentBulk(agentIds.map((id) => ({ id })))
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.deleteGeneratorBulk(generatorIds.map((id) => ({ id }))));
  });

  after(function() {
    return client.deleteAgentBulk(agentIds.map((id) => ({ id })))
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.deleteGeneratorBulk(generatorIds.map((id) => ({ id }))));
  });

  function testAgentIntegrity(agent, agentName, configuration) {
    expect(agent).to.be.ok;
    expect(agent.id).to.be.equal(agentName);
    expect(agent.status).to.not.be.equal(400);
    return client.getAgent(agent.id)
      .then((retrieveAgent) => {
        expect(retrieveAgent.configuration).to.be.deep.equal(configuration);
      });
  }

  const TS0 = CONFIGURATION_1_OPERATIONS_1[CONFIGURATION_1_OPERATIONS_1.length - 1].timestamp;

  // createAgentBulk
  it('createAgentBulk: should succeed when using valid configurations and generated ids', function() {
    return client
      .createAgentBulk([
        { configuration: CONFIGURATION_1 },
        { configuration: CONFIGURATION_1 }
      ])
      .then((agentsList) => Promise.all(agentsList.map((agent) =>
        testAgentIntegrity(agent, agent.id, CONFIGURATION_1)
      )));
  });

  it('createAgentBulk: should succeed when using valid configurations and a specified id', function() {
    return client
      .createAgentBulk([
        { id: agentIds[0], configuration: CONFIGURATION_1 },
        { configuration: CONFIGURATION_1 }
      ])
      .then((agentsList) => Promise.all(agentsList.map((agent) =>
        testAgentIntegrity(agent, agent.id, CONFIGURATION_1)
      )));
  });

  it('createAgentBulk: should succeed when using valid configurations and specified ids', function() {
    return client
      .createAgentBulk([
        { id: agentIds[0], configuration: CONFIGURATION_1 },
        { id: agentIds[1], configuration: CONFIGURATION_1 },
        { id: agentIds[2], configuration: CONFIGURATION_1 }
      ])
      .then((agentsList) => Promise.all(agentsList.map((agent) =>
        testAgentIntegrity(agent, agent.id, CONFIGURATION_1)
      )));
  });

  it('createAgentBulk: should handle invalid configuration', function() {
    return client
      .createAgentBulk([
        { id: agentIds[0], configuration: CONFIGURATION_1 },
        { id: agentIds[1], configuration: INVALID_CONFIGURATION_1 }
      ])
      .catch((err) => {
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      });
  });

  it('createAgentBulk: should handle undefined configuration', function() {
    return client
      .createAgentBulk([
        { id: agentIds[0], configuration: CONFIGURATION_1 },
        { id: agentIds[1], configuration: undefined }
      ])
      .catch((err) => {
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      });
  });

  it('createAgentBulk: should fail when invalid id', function() {
    return client
      .createAgentBulk([
        { configuration: CONFIGURATION_1 },
        { id: 'francis?cabrel', configuration: CONFIGURATION_1 }
      ])
      .catch((err) => {
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      });
  });

  it('createAgentBulk: should 200 then 400 when using the same id twice', function() {
    return client
      .createAgentBulk([{ id: agentIds[0], configuration: CONFIGURATION_1 }])
      .then((agentsList0) => Promise.all(agentsList0.map((agent) =>
        testAgentIntegrity(agent, agentIds[0], CONFIGURATION_1)
      )))
      .then(() => client.createAgentBulk([{ id: agentIds[0], configuration: CONFIGURATION_1 }]))
      .then((agentsList1) => agentsList1.map((agent) => {
        expect(agent).to.be.ok;
        expect(agent.id).to.be.equal(agentIds[0]);
        expect(agent.status).to.be.equal(400);
      }));
  });

  it('createAgentBulk: should return array of 200 and 400 if has mixed results', function() {
    return client
      .createAgentBulk([{ id: agentIds[0], configuration: CONFIGURATION_1 }])
      .then((agentsList0) => Promise.all(agentsList0.map((agent) =>
        testAgentIntegrity(agent, agent.id, CONFIGURATION_1)
      )))
      .then(() => client.createAgentBulk([
        { id: agentIds[0], configuration: CONFIGURATION_1 },
        { id: agentIds[1], configuration: CONFIGURATION_1 }
      ]))
      .then((agentsList1) => {
        const agent0 = agentsList1[0];
        const agent1 = agentsList1[1];
        expect(agent0.id).to.be.equal(agentIds[0]);
        expect(agent1.id).to.be.equal(agentIds[1]);
        expect(agent0.status).to.be.equal(400);
        expect(agent0.name).to.be.equal('ContextError');
      });
  });

  // deleteAgentBulk
  it('deleteAgentBulk: should succeed when using valid ids.', function() {
    const agentIdsToTest = [
      { id: agentIds[0] },
      { id: agentIds[1] },
      { id: agentIds[2] }
    ];
    const expectedResult = [
      { message: `Agent "${agentIds[0]}" doesn't exist (or was already deleted).` },
      { message: `Agent "${agentIds[1]}" doesn't exist (or was already deleted).` },
      { message: `Agent "${agentIds[2]}" doesn't exist (or was already deleted).` }
    ];
    return client
      .createAgentBulk(
        agentIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      )
      .then((agentsList0) => Promise.all(agentsList0.map((agent, idx) =>
        testAgentIntegrity(agent, agentIdsToTest[idx].id, CONFIGURATION_1)
      )))
      .then(() => client.deleteAgentBulk(agentIdsToTest))
      .then((deletions) => Promise.all(deletions))
      .then((agentsList1) => agentsList1.map((agent, idx) => {
        expect(agent.id).to.be.equal(agentIdsToTest[idx].id);
        expect(agent.configuration).to.be.deep.equal(CONFIGURATION_1);
      }))
      .then(() => client.deleteAgentBulk(agentIdsToTest))
      .then((deletions) => Promise.all(deletions))
      .then((agentsList2) => {
        expect(agentsList2).to.be.deep.equals(expectedResult);
      });
  });

  it('deleteAgentBulk: should handle undefined id', function() {
    const agentIds = [{ id: '7$ shopping' }, {}, { id: undefined }];
    return client.deleteAgentBulk(agentIds)
      .then((deletions) => Promise.all(deletions))
      .catch((err) => {
        expect(err.message).to.be.contains('[AgentError] No agent id or invalid agent id given at index 0 in the request body.');
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      });
  });

  // addAgentContextOperationsBulk
  it('addAgentContextOperationsBulk: should work with 10 agents with small number of operations', function() {
    return client
      .createAgentBulk(
        agentIds.map((id) => ({ id, configuration: CONFIGURATION_1 }))
      )
      .then(() => client.addAgentContextOperationsBulk(agentIds.map((id) => ({
        id,
        operations: CONFIGURATION_1_OPERATIONS_1
      }))))
      .then((result) => agentIds.map((agent, idx) => {
        expect(result[idx].id).to.be.equal(agent);
        expect(result[idx].status).to.be.equal(201);
      }));
  });

  it('addAgentContextOperationsBulk: should work with 10 agents with large number of operations', function() {
    const agentIdsToTest = [
      { id: agentIds[0] },
      { id: agentIds[1] },
      { id: agentIds[2] },
      { id: agentIds[3] },
      { id: agentIds[4] },
      { id: agentIds[5] },
      { id: agentIds[6] },
      { id: agentIds[7] },
      { id: agentIds[8] },
      { id: agentIds[9] }
    ];
    return client.createAgentBulk(agentIdsToTest
      .map(({ id }) => ({ id, configuration: CONFIGURATION_1 })))
      .then(() => client.addAgentContextOperationsBulk(agentIdsToTest
        .map(({ id }) => ({ id, operations: CONFIGURATION_1_OPERATIONS_2 }))))
      .then((result) => agentIdsToTest.map((agent, idx) => {
        expect(result[idx].id).to.be.equal(agent.id);
        expect(result[idx].status).to.be.equal(201);
      }));
  });

  it('addAgentContextOperationsBulk: should succeed with agents with different number of operations', function() {
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }, { id: agentIds[2] }];
    return client
      .createAgentBulk(
        agentIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      )
      .then(() => client.addAgentContextOperationsBulk([
        { id: agentIds[0], operations: CONFIGURATION_1_OPERATIONS_1 }, // S
        { id: agentIds[1], operations: CONFIGURATION_1_OPERATIONS_2 }, // large
        { id: agentIds[2], operations: CONFIGURATION_1_OPERATIONS_1 } // S
      ]))
      .then((result) => {
        expect(result[0].id).to.be.equal(agentIds[1]);
        expect(result[1].id).to.be.equal(agentIds[0]);
        expect(result[2].id).to.be.equal(agentIds[2]);
        result.map(({ status }) => expect(status).to.be.equal(201));
      });
  });

  it('addAgentContextOperationsBulk: should handle invalid agents', function() {
    const agentIdsToTest = [{ id: agentIds[0] }];
    const agentWrongIds = [
      ...agentIdsToTest,
      { id: 'john_doe_not_found' }
    ];
    return client
      .createAgentBulk(
        agentIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      )
      .then(() => client.addAgentContextOperationsBulk(
        agentWrongIds.map(({ id }) => ({
          id,
          operations: CONFIGURATION_1_OPERATIONS_1
        }))
      ))
      .then((result) => {
        expect(result[0].id).to.be.equal(agentWrongIds[0].id);
        expect(result[0].status).to.be.equal(201);
        expect(result[1].id).to.be.equal(agentWrongIds[1].id);
        expect(result[1].status).to.be.equal(404);
        expect(result[1].name).to.be.equal('NotFound');
      });
  });

  it('addAgentContextOperationsBulk: should handle invalid context', function() {
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];
    return client
      .createAgentBulk(
        agentIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      )
      .then(() => client.addAgentContextOperationsBulk(
        agentIdsToTest.map(({ id }) => ({
          id,
          operations: INVALID_CONFIGURATION_1_OPERATIONS_1
        })))
      )
      .then((results) => {
        results.map((agent_res, idx) => {
          expect(agent_res.id).to.be.equal(agentIdsToTest[idx].id);
          expect(agent_res.status).to.be.equal(400);
          expect(agent_res.name).to.be.equal('InvalidPropertyValue');
        });
      });
  });

  // getAgentDecisionTreeBulk
  it('getAgentDecisionTreeBulk: should work with two valid agents', function() {
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];
    return client
      .createAgentBulk(
        agentIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      )
      .then(() => client.addAgentContextOperationsBulk(
        agentIdsToTest.map(({ id }) => ({
          id,
          operations: CONFIGURATION_1_OPERATIONS_1
        })))
      )
      .then(() => client.getAgentDecisionTreeBulk(
        agentIdsToTest.map(({ id }) => ({ id, timestamp: TS0 }))
      ))
      .then((agentTrees) => {
        agentTrees.map((agent, idx) => {
          expect(agent.id).to.be.equal(agentIdsToTest[idx].id);
          expect(agent.timestamp).to.be.equal(TS0);
          expect(agent).to.be.ok;
          const { _version, configuration, trees } = agent.tree;
          expect(trees).to.be.ok;
          expect(_version).to.be.equal('1.1.0');
          expect(configuration).to.be.deep.equal(CONFIGURATION_1);
        });
      });
  });

  it('getAgentDecisionTreeBulk: should handle invalid agents ids', function() {
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[2] }];
    const agentWrongIds = [...agentIdsToTest, { id: 'w3!rD_[D' }];
    return client
      .createAgentBulk(agentIdsToTest.map(({ id }) =>
        ({ id, configuration: CONFIGURATION_1 }))
      )
      .then(() => client.addAgentContextOperationsBulk(agentIdsToTest.map(({ id }) => ({
        id,
        operations: CONFIGURATION_1_OPERATIONS_1
      }))))
      .then(() => client.getAgentDecisionTreeBulk(agentWrongIds
        .map(({ id }) => ({ id, timestamp: TS0 }))))
      .catch((err) => {
        expect(err.message).to.be.contains('No agent id or invalid agent id given at index 2 in the request body.');
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      });
  });

  it('getAgentDecisionTreeBulk: should handle several timestamps', function() {
    const timestamps = [TS0, TS0 + 1000, TS0 + 2000];
    return client
      .createAgentBulk([{
        id: agentIds[0], configuration: CONFIGURATION_1
      }])
      .then(() => client.addAgentContextOperationsBulk([{
        id: agentIds[0],
        operations: CONFIGURATION_1_OPERATIONS_1
      }]))
      .then(() => client.getAgentDecisionTreeBulk(
        timestamps.map((timestamp) => ({ id: agentIds[0], timestamp }))
      ))
      .then((agentTrees) => {
        agentTrees.map((agent, idx) => {
          expect(agent.id).to.be.equal(agentIds[0]);
          expect(agent.timestamp).to.be.equal(timestamps[idx]);
          expect(agent).to.be.ok;
          const { _version, configuration, trees } = agent.tree;
          expect(trees).to.be.ok;
          expect(_version).to.be.equal('1.1.0');
          expect(configuration).to.be.deep.equal(CONFIGURATION_1);
        });
      });
  });

  it('getAgentDecisionTreeBulk: should handle invalid timestamps', function() {
    const timestamps = [TS0, 'INVALID_TIMESTAMP'];
    return client
      .createAgentBulk([{
        id: agentIds[0], configuration: CONFIGURATION_1
      }])
      .then(() => client.addAgentContextOperationsBulk([{
        id: agentIds[0],
        operations: CONFIGURATION_1_OPERATIONS_1
      }]))
      .then(() => client.getAgentDecisionTreeBulk(timestamps
        .map((timestamp) => ({ id: agentIds[0], timestamp }))))
      .catch((err) => {
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      });
  });

  //computeAgentBoostingDecisionBulk
  it('computeAgentBoostingDecisionBulk: should work with two valid agents', function() {
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];
    return client
      .createAgentBulk(
        agentIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_BOOSTING_1 }))
      )
      .then(() => client.addAgentContextOperationsBulk(
        agentIdsToTest.map(({ id }) => ({
          id,
          operations: CONFIGURATION_BOOSTING_1_OPERATIONS_1
        })))
      )
      .then(() => client.computeAgentBoostingDecisionBulk(
        agentIdsToTest.map(({ id }) => ({ entityName: id, timeWindow: REQUESTED_TIMEWINDOW, context: BOOSTING_CONTEXT }))
      ))
      .then((boostingDecisions) => {
        boostingDecisions.map((decision, idx) => {
          const { _version, entityName, context, timeWindow, output } = decision;
          expect(_version).to.be.equal('1.0.0');
          expect(entityName).to.be.equal(agentIdsToTest[idx].id);
          expect(timeWindow[0]).to.be.equal(REQUESTED_TIMEWINDOW[0]);
          expect(timeWindow[1]).to.be.equal(REQUESTED_TIMEWINDOW[1]);
          expect(output.predicted_value).to.be.equal('black');
          const { presence, lightIntensity } = context;
          expect(presence).to.be.equal(BOOSTING_CONTEXT.presence);
          expect(lightIntensity).to.be.equal(BOOSTING_CONTEXT.lightIntensity);
        });
      });
  });

  it('computeAgentBoostingDecisionBulk: should handle not found agent', function() {
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];
    const agentWrongIds = [...agentIdsToTest, { id: 'test_test' }];
    return client
      .createAgentBulk(
        agentIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_BOOSTING_1 }))
      )
      .then(() => client.addAgentContextOperationsBulk(
        agentIdsToTest.map(({ id }) => ({
          id,
          operations: CONFIGURATION_BOOSTING_1_OPERATIONS_1
        })))
      )
      .then(() => client.computeAgentBoostingDecisionBulk(
        agentWrongIds.map(({ id }) => ({ entityName: id, timeWindow: REQUESTED_TIMEWINDOW, context: BOOSTING_CONTEXT }))
      ))
      .then((boostingDecisions) => {
        expect(boostingDecisions[0].entityName).to.be.equal(agentWrongIds[0].id);
        expect(boostingDecisions[0].timeWindow[0]).to.be.equal(REQUESTED_TIMEWINDOW[0]);
        expect(boostingDecisions[0].timeWindow[1]).to.be.equal(REQUESTED_TIMEWINDOW[1]);
        expect(boostingDecisions[0]._version).to.be.equal('1.0.0');
        expect(boostingDecisions[0].output.predicted_value).to.be.equal('black');
        expect(boostingDecisions[0].context.presence).to.be.equal(BOOSTING_CONTEXT.presence);
        expect(boostingDecisions[0].context.lightIntensity).to.be.equal(BOOSTING_CONTEXT.lightIntensity);

        expect(boostingDecisions[1].entityName).to.be.equal(agentWrongIds[1].id);
        expect(boostingDecisions[1].timeWindow[0]).to.be.equal(REQUESTED_TIMEWINDOW[0]);
        expect(boostingDecisions[1].timeWindow[1]).to.be.equal(REQUESTED_TIMEWINDOW[1]);
        expect(boostingDecisions[1]._version).to.be.equal('1.0.0');
        expect(boostingDecisions[1].output.predicted_value).to.be.equal('black');
        expect(boostingDecisions[1].context.presence).to.be.equal(BOOSTING_CONTEXT.presence);
        expect(boostingDecisions[1].context.lightIntensity).to.be.equal(BOOSTING_CONTEXT.lightIntensity);

        expect(boostingDecisions[2].entityName).to.be.equal(agentWrongIds[2].id);
        expect(boostingDecisions[2].timeWindow[0]).to.be.equal(REQUESTED_TIMEWINDOW[0]);
        expect(boostingDecisions[2].timeWindow[1]).to.be.equal(REQUESTED_TIMEWINDOW[1]);
        expect(boostingDecisions[2].name).to.be.equal('NotFound');
        expect(boostingDecisions[2].status).to.be.equal(404);
      });
  });

  it('computeAgentBoostingDecisionBulk: should fail when empty array', function() {
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];
    return client.computeAgentBoostingDecisionBulk(
      agentIdsToTest.map(({ id }) => ({ entityName: id, timeWindow: REQUESTED_TIMEWINDOW, context: BOOSTING_CONTEXT }))
    )
      .catch((err) => expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError));
  });

  //bulk generator

  //createGeneratorBulk
  it('createGeneratorBulk: should succeed when using valid configurations and a specified id', function() {
    return client
      .createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { id: generatorIds[1], configuration: CONFIGURATION_1_GENERATOR }
      ])
      .then(() => Promise.all([
        client.getGenerator(generatorIds[0]),
        client.getGenerator(generatorIds[1])
      ]))
      .then((generators) => {
        expect(generators[0].id).to.be.equal(generatorIds[0]);
        expect(generators[1].id).to.be.equal(generatorIds[1]);
        expect(generators[0].configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
        expect(generators[1].configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
      });
  });

  it('createGeneratorBulk: should handle invalid configuration', function() {
    return client
      .createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { id: generatorIds[1], configuration: CONFIGURATION_1 }
      ])
      .then(() => client.getGenerator(generatorIds[0]))
      .then((generator) => {
        expect(generator.id).to.be.equal(generatorIds[0]);
        expect(generator.configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
      })
      .then(() => client.getGenerator(generatorIds[1]))
      .catch((err) => {
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      });
  });

  it('createGeneratorBulk: should handle undefined configuration', function() {
    return client
      .createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { id: generatorIds[1] }
      ])
      .then(() => client.getGenerator(generatorIds[0]))
      .then((generator) => {
        expect(generator.id).to.be.equal(generatorIds[0]);
        expect(generator.configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
      })
      .then(() => client.getGenerator(generatorIds[1]))
      .catch((err) => {
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      });
  });

  it('createGeneratorBulk: should handle undefined id', function() {
    return client
      .createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { configuration: CONFIGURATION_1_GENERATOR }
      ])
      .catch((err) => {
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      });
  });

  it('createGeneratorBulk: should 200 then 400 when using the same id twice', function() {
    return client
      .createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR }
      ])
      .then((generators) => {
        expect(generators[0].id).to.be.equal(generatorIds[0]);
        expect(generators[1].status).to.be.equal(400);
        expect(generators[1].name).to.be.equal('ContextError');
      });
  });

  // deleteGeneratorBulk
  it('deleteGeneratorBulk: should succeed when using valid ids.', function() {
    const generatorIdsToTests = [
      { id: generatorIds[0] },
      { id: generatorIds[1] },
      { id: generatorIds[2] }
    ];
    const expectedResults = [
      { message: `Generator "${generatorIds[0]}" doesn't exist (or was already deleted).` },
      { message: `Generator "${generatorIds[1]}" doesn't exist (or was already deleted).` },
      { message: `Generator "${generatorIds[2]}" doesn't exist (or was already deleted).` }
    ];
    return client
      .createGeneratorBulk(
        generatorIdsToTests.map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))
      )
      .then(() => Promise.all([
        client.getGenerator(generatorIds[0]),
        client.getGenerator(generatorIds[1]),
        client.getGenerator(generatorIds[2])
      ]))
      .then((generators) => {
        expect(generators[0].id).to.be.equal(generatorIds[0]);
        expect(generators[0].configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
        expect(generators[1].id).to.be.equal(generatorIds[1]);
        expect(generators[1].configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
        expect(generators[2].id).to.be.equal(generatorIds[2]);
        expect(generators[2].configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
      })
      .then(() => client.deleteGeneratorBulk(generatorIdsToTests))
      .then((deletions) => deletions
        .map((generator, i) => {
          expect(generator.id).to.be.equal(generatorIdsToTests[i].id);
          expect(generator.configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
        })
      )
      .then(() => client.deleteGeneratorBulk(generatorIdsToTests))
      .then((generatorsListRedelete) => expect(generatorsListRedelete).to.be.deep.equal(expectedResults));
  });

  it('deleteGeneratorBulk: Error for unvalid id.', function() {
    const generatorIdsToTest = [{ id: '' }];
    return client.deleteGeneratorBulk(generatorIdsToTest)
      .then((res) => {
        expect(res[0].name).to.be.equal('GeneratorError');
        expect(res[0].status).to.be.equal(400);
      });
  });

  it('deleteGeneratorBulk: should fail with non existing id.', function() {
    const generatorIdsToTest = [{ id: 'toto_non_existing' }];
    return client.deleteGeneratorBulk(generatorIdsToTest)
      .then((res) => expect(res[0].message).to.be.equal('Generator "toto_non_existing" doesn\'t exist (or was already deleted).'));
  });

  // getGeneratorDecisionTreeBulk
  it('getGeneratorDecisionTreeBulk: should work with two valid generators', function() {
    const generatorIdsToTest = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client
      .createAgentBulk(agentIdsToTest
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 })))
      .then(() => client.addAgentContextOperationsBulk(agentIdsToTest
        .map(({ id }) => ({ id, operations: CONFIGURATION_1_OPERATIONS_1 }))))
      .then(() => client.createGeneratorBulk(generatorIdsToTest
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))))
      .then(() => client.getGeneratorDecisionTreeBulk(generatorIdsToTest
        .map(({ id }) => ({ id, timestamp: 1464600500 }))))
      .then((trees) => {
        trees.map((metatree) => {
          const { tree, timestamp } = metatree;
          expect(timestamp).to.be.equal(1464600500);
          expect(tree._version).to.be.equal('1.1.0');
          expect(tree.trees).to.be.ok;
        });
      });
  });

  it('getGeneratorDecisionTreeBulk: with non-existing generators', function() {
    const generatorIdsToTest = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client
      .createAgentBulk(agentIdsToTest
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 })))
      .then(() => client.addAgentContextOperationsBulk(agentIdsToTest
        .map(({ id }) => ({ id, operations: CONFIGURATION_1_OPERATIONS_1 }))))
      .then(() => client.createGeneratorBulk(generatorIdsToTest
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))))
      .then(() => client.getGeneratorDecisionTreeBulk(generatorIdsToTest
        .map(() => ({ id: 'non-existing', timestamp: 1464600500 }))))
      .then((results) => {
        results.map((result) => {
          expect(result.name).to.be.equal('NotFound');
          expect(result.status).to.be.equal(404);
        });
      });
  });

  it('getGeneratorDecisionTreeBulk: mixed results with one existing and one non-exsiting generators', function() {
    const generatorIdsToTest = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client
      .createAgentBulk(agentIdsToTest
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 })))
      .then(() => client.addAgentContextOperationsBulk(agentIdsToTest
        .map(({ id }) => ({ id, operations: CONFIGURATION_1_OPERATIONS_1 }))))
      .then(() => client.createGeneratorBulk(generatorIdsToTest
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))))
      .then(() => client.getGeneratorDecisionTreeBulk([
        { id: generatorIds[0], timestamp: 1464600500 },
        { id: 'non-existing', timestamp: 1464600500 }
      ]))
      .then(([metatree, result]) => {
        expect(metatree.timestamp).to.be.equal(1464600500);
        expect(metatree.tree._version).to.be.equal('1.1.0');
        expect(metatree.tree.trees).to.be.ok;
        expect(result.name).to.be.equal('NotFound');
        expect(result.status).to.be.equal(404);
      });
  });

  it('getGeneratorDecisionTreeBulk: mixed results with one without contextops', function() {
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];
    const configuration_custom_1 = JSON.parse(JSON.stringify(CONFIGURATION_1_GENERATOR));
    configuration_custom_1.filter = [agentIds[0]];
    const configuration_custom_2 = JSON.parse(JSON.stringify(CONFIGURATION_1_GENERATOR));
    configuration_custom_2.filter = [agentIds[1]];

    return client
      .createAgentBulk(agentIdsToTest
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 })))
      .then(() => client.addAgentContextOperationsBulk([
        { id: agentIds[0], operations: CONFIGURATION_1_OPERATIONS_1 }
      ]))
      .then(() => client.createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { id: generatorIds[1], configuration: configuration_custom_2 }
      ]))
      .then(() => client.getGeneratorDecisionTreeBulk([
        { id: generatorIds[0], timestamp: 1464600500 },
        { id: generatorIds[1], timestamp: 1464600500 }
      ]))
      .then(([res1, res2]) => {
        expect(res1.id).to.be.equal(generatorIds[0]);
        expect(res1.tree.trees).to.be.ok;
        expect(res2.status).to.be.equal(500);
        expect(res2.name).to.be.equal('InternalError');
      });
  });

  it('getGeneratorDecisionTreeBulk: should fail without contextops', function() {
    const generatorIdsToTest = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client.createAgentBulk(agentIdsToTest
      .map(({ id }) => ({ id, configuration: CONFIGURATION_1 })))
      .then(() => client.createGeneratorBulk(generatorIdsToTest
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))))
      .then(() => client.getGeneratorDecisionTreeBulk(generatorIdsToTest
        .map(({ id }) => ({ id, timestamp: 1464600500 }))))
      .then(([res1, res2]) => {
        expect(res1.id).to.be.equal(generatorIds[0]);
        expect(res1.name).to.be.equal('InternalError');
        expect(res1.status).to.be.equal(500);
        expect(res2.id).to.be.equal(generatorIds[1]);
        expect(res2.name).to.be.equal('InternalError');
        expect(res2.status).to.be.equal(500);
      });
  });

  it('computeGeneratorBoostingDecisionBulk: should work with two valid generators', function() {
    const generatorIdsToTest = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client.createAgentBulk(
      agentIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_BOOSTING_1 }))
    )
      .then(() => client.addAgentContextOperationsBulk(
        agentIdsToTest.map(({ id }) => ({
          id,
          operations: CONFIGURATION_BOOSTING_1_OPERATIONS_1
        })))
      )
      .then(() => client.createGeneratorBulk(
        generatorIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_BOOSTING_1_GENERATOR })))
      )
      .then(() => client.computeGeneratorBoostingDecisionBulk(
        generatorIdsToTest.map(({ id }) => ({ entityName: id, timeWindow: REQUESTED_TIMEWINDOW, context: BOOSTING_CONTEXT }))
      ))
      .then((boostingDecisions) => {
        boostingDecisions.map((decision, idx) => {
          const { _version, entityName, context, timeWindow, output } = decision;
          expect(_version).to.be.equal('1.0.0');
          expect(entityName).to.be.equal(generatorIdsToTest[idx].id);
          expect(timeWindow[0]).to.be.equal(REQUESTED_TIMEWINDOW[0]);
          expect(timeWindow[1]).to.be.equal(REQUESTED_TIMEWINDOW[1]);
          expect(output.predicted_value).to.be.equal('black');
          const { presence, lightIntensity } = context;
          expect(presence).to.be.equal(BOOSTING_CONTEXT.presence);
          expect(lightIntensity).to.be.equal(BOOSTING_CONTEXT.lightIntensity);
        });
      });
  });

  it('computeGeneratorBoostingDecisionBulk: should handle not found generator', function() {
    const generatorIdsToTest = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const generatorWrongIds = [...generatorIdsToTest, { id: 'test_test' }];
    const agentIdsToTest = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client.createAgentBulk(
      agentIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_BOOSTING_1 }))
    )
      .then(() => client.addAgentContextOperationsBulk(
        agentIdsToTest.map(({ id }) => ({
          id,
          operations: CONFIGURATION_BOOSTING_1_OPERATIONS_1
        })))
      )
      .then(() => client.createGeneratorBulk(
        generatorIdsToTest.map(({ id }) => ({ id, configuration: CONFIGURATION_BOOSTING_1_GENERATOR })))
      )
      .then(() => client.computeGeneratorBoostingDecisionBulk(
        generatorWrongIds.map(({ id }) => ({ entityName: id, timeWindow: REQUESTED_TIMEWINDOW, context: BOOSTING_CONTEXT }))
      ))
      .then((boostingDecisions) => {
        expect(boostingDecisions[0].entityName).to.be.equal(generatorWrongIds[0].id);
        expect(boostingDecisions[0].timeWindow[0]).to.be.equal(REQUESTED_TIMEWINDOW[0]);
        expect(boostingDecisions[0].timeWindow[1]).to.be.equal(REQUESTED_TIMEWINDOW[1]);
        expect(boostingDecisions[0]._version).to.be.equal('1.0.0');
        expect(boostingDecisions[0].output.predicted_value).to.be.equal('black');
        expect(boostingDecisions[0].context.presence).to.be.equal(BOOSTING_CONTEXT.presence);
        expect(boostingDecisions[0].context.lightIntensity).to.be.equal(BOOSTING_CONTEXT.lightIntensity);

        expect(boostingDecisions[1].entityName).to.be.equal(generatorWrongIds[1].id);
        expect(boostingDecisions[1].timeWindow[0]).to.be.equal(REQUESTED_TIMEWINDOW[0]);
        expect(boostingDecisions[1].timeWindow[1]).to.be.equal(REQUESTED_TIMEWINDOW[1]);
        expect(boostingDecisions[1]._version).to.be.equal('1.0.0');
        expect(boostingDecisions[1].output.predicted_value).to.be.equal('black');
        expect(boostingDecisions[1].context.presence).to.be.equal(BOOSTING_CONTEXT.presence);
        expect(boostingDecisions[1].context.lightIntensity).to.be.equal(BOOSTING_CONTEXT.lightIntensity);

        expect(boostingDecisions[2].entityName).to.be.equal(generatorWrongIds[2].id);
        expect(boostingDecisions[2].timeWindow[0]).to.be.equal(REQUESTED_TIMEWINDOW[0]);
        expect(boostingDecisions[2].timeWindow[1]).to.be.equal(REQUESTED_TIMEWINDOW[1]);
        expect(boostingDecisions[2].name).to.be.equal('NotFound');
        expect(boostingDecisions[2].status).to.be.equal(404);
      });
  });

  it('computeGeneratorBoostingDecisionBulk: should fail when empty array', function() {
    const generatorIdsToTest = [{ id: generatorIds[0] }, { id: generatorIds[1] }];

    return client.computeGeneratorBoostingDecisionBulk(
      generatorIdsToTest.map(({ id }) => ({ entityName: id, timeWindow: REQUESTED_TIMEWINDOW, context: BOOSTING_CONTEXT }))
    )
      .catch((err) => expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError));
  });
});
