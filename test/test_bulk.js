import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_GENERATOR from './data/configuration_1_generator.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import CONFIGURATION_1_OPERATIONS_2 from './data/configuration_1_operations_2.json';
import craftai from '../src';
import { expect } from 'chai';
import INVALID_CONFIGURATION_1 from './data/invalid_configuration_1.json';
import INVALID_CONFIGURATION_1_OPERATIONS_1 from './data/invalid_configuration_1_operations_1.json';

import '../src/polyfill';

describe('BULK:', function() {
  let client;
  const agentIds = [`agent_bulk_0_${RUN_ID}`, `agent_bulk_1_${RUN_ID}`, `agent_bulk_2_${RUN_ID}`];
  const generatorIds = [`generator_bulk_0_${RUN_ID}`, `generator_bulk_1_${RUN_ID}`, `generator_bulk_2_${RUN_ID}`];

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
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
          .then(() => client.deleteAgent(agent.id))
      )))
      .then((deletions) => Promise.allSettled(deletions));
  });

  it('createAgentBulk: should succeed when using valid configurations and a specified id', function() {
    return client
      .deleteAgentBulk([{ id: agentIds[0] }])
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk([
        { id: agentIds[0], configuration: CONFIGURATION_1 },
        { configuration: CONFIGURATION_1 }
      ]))
      .then((agentsList) => Promise.all(agentsList.map((agent) =>
        testAgentIntegrity(agent, agent.id, CONFIGURATION_1)
          .then(() => client.deleteAgent(agent.id))
      )))
      .then((deletions) => Promise.allSettled(deletions));
  });

  it('createAgentBulk: should succeed when using valid configurations and specified ids', function() {
    return client
      .deleteAgentBulk([{ id: agentIds[0] }, { id: agentIds[1] }, { id: agentIds[2] }])
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk([
        { id: agentIds[0], configuration: CONFIGURATION_1 },
        { id: agentIds[1], configuration: CONFIGURATION_1 },
        { id: agentIds[2], configuration: CONFIGURATION_1 }
      ]))
      .then((agentsList) => Promise.all(agentsList.map((agent) =>
        testAgentIntegrity(agent, agent.id, CONFIGURATION_1)
          .then(() => client.deleteAgent(agent.id))
      )))
      .then((deletions) => Promise.allSettled(deletions));
  });

  it('createAgentBulk: should handle invalid configuration', function() {
    return client
      .deleteAgentBulk([
        { id: agentIds[0] },
        { id: agentIds[1] }
      ])
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk([
        { id: agentIds[0], configuration: CONFIGURATION_1 },
        { id: agentIds[1], configuration: INVALID_CONFIGURATION_1 }
      ]))
      .then((agentsList) => {
        const badAgent = agentsList[0].status ? agentsList[0] : agentsList[1];
        const correctAgent = agentsList[0].status ? agentsList[1] : agentsList[0];

        return testAgentIntegrity(correctAgent, agentIds[0], CONFIGURATION_1)
          .then(() => {
            expect(badAgent.status).to.be.equal(400);
            expect(badAgent.name).to.be.equal('ContextError');
            return Promise.all(agentsList.map(({ id }) => client.deleteAgent(id)));
          });
      });
  });

  it('createAgentBulk: should handle undefined configuration', function() {
    return client
      .deleteAgentBulk([
        { id: agentIds[0] },
        { id: agentIds[1] }
      ])
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk([
        { id: agentIds[0], configuration: CONFIGURATION_1 },
        { id: agentIds[1], configuration: undefined }
      ]))
      .then((agentsList) => {
        const agent0 = agentsList[0];
        return testAgentIntegrity(agent0, agentIds[0], CONFIGURATION_1)
          .then(() => {
            const agent1 = agentsList[1];
            expect(agent1.status).to.be.equal(400);
            expect(agent1.name).to.be.equal('ContextError');

            return Promise.all(agentsList.map(({ id }) => client.deleteAgent(id)));
          });
      });
  });

  it('createAgentBulk: should handle invalid id', function() {
    return client
      .createAgentBulk([
        { configuration: CONFIGURATION_1 },
        { id: 'francis?cabrel', configuration: CONFIGURATION_1 }
      ])
      .then((agentsList) => {
        const agent0 = agentsList[0];
        return testAgentIntegrity(agent0, agent0.id, CONFIGURATION_1)
          .then(() => {
            const agent1 = agentsList[1];
            expect(agent1.id).to.be.equal('francis?cabrel');
            expect(agent1.status).to.be.equal(400);
            expect(agent1.name).to.be.equal('AgentError');

            return client.deleteAgent(agent0.id);
          });
      });
  });

  it('createAgentBulk: should 200 then 400 when using the same id twice', function() {
    return client.deleteAgentBulk([{ id: agentIds[0] }])
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk([{ id: agentIds[0], configuration: CONFIGURATION_1 }]))
      .then((agentsList0) => Promise.all(agentsList0.map((agent) =>
        testAgentIntegrity(agent, agentIds[0], CONFIGURATION_1)
      )))
      .then(() => client.createAgentBulk([{ id: agentIds[0], configuration: CONFIGURATION_1 }]))
      .then((agentsList1) => agentsList1.map((agent) => {
        expect(agent).to.be.ok;
        expect(agent.id).to.be.equal(agentIds[0]);
        expect(agent.status).to.be.equal(400);
      }))
      .then(() => client.deleteAgent(agentIds[0]));
  });

  it('createAgentBulk: should return array of 200 and 400 if has mixed results', function() {
    return client
      .deleteAgentBulk([{ id: agentIds[0] }, { id: agentIds[1] }])
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk([{ id: agentIds[0], configuration: CONFIGURATION_1 }]))
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

        return Promise.all(agentsList1.map(({ id }) => client.deleteAgent(id)));
      });
  });

  // deleteAgentBulk
  it('deleteAgentBulk: should succeed when using valid ids.', function() {
    const agentIds = [
      { id: agentIds[0] },
      { id: agentIds[1] },
      { id: agentIds[2] }
    ];
    const expectedResult = [
      { message: `Agent "${agentIds[0]}" doesn't exist (or was already deleted).` },
      { message: `Agent "${agentIds[1]}" doesn't exist (or was already deleted).` },
      { message: `Agent "${agentIds[2]}" doesn't exist (or was already deleted).` }
    ];
    return client.deleteAgentBulk(agentIds)
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(
        agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      ))
      .then((agentsList0) => Promise.all(agentsList0.map((agent, idx) =>
        testAgentIntegrity(agent, agentIds[idx].id, CONFIGURATION_1)
      )))
      .then(() => client.deleteAgentBulk(agentIds))
      .then((deletions) => Promise.all(deletions))
      .then((agentsList1) => agentsList1.map((agent, idx) => {
        expect(agent.id).to.be.equal(agentIds[idx].id);
        expect(agent.configuration).to.be.deep.equal(CONFIGURATION_1);
      }))
      .then(() => client.deleteAgentBulk(agentIds))
      .then((deletions) => Promise.all(deletions))
      .then((agentsList2) => {
        expect(agentsList2).to.be.deep.equals(expectedResult);
      });
  });

  it('deleteAgentBulk: should handle undefined id', function() {
    const agentIds = [{ id: '7$ shopping' }, {}, { id: undefined }];
    return client.deleteAgentBulk(agentIds)
      .then((deletions) => Promise.all(deletions))
      .then((del_res) => {
        expect(del_res[0].status).to.be.equal(400);
        expect(del_res[0].name).to.be.equal('AgentError');
        expect(del_res[1].status).to.be.equal(400);
        expect(del_res[1].name).to.be.equal('AgentError');
        expect(del_res[2].status).to.be.equal(400);
        expect(del_res[2].name).to.be.equal('AgentError');
      });
  });

  // addAgentContextOperationsBulk
  it('addAgentContextOperationsBulk: should work with 10 agents with small number of operations', function() {
    this.timeout(100000); // TODO: To be removed.
    const agentIds = Array.apply(null, Array(10))
      .map((x, i) => ({
        id: `agent${i}_${RUN_ID}`
      }));

    return client
      .deleteAgentBulk(agentIds)
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(
        agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      ))
      .then(() => client.addAgentContextOperationsBulk(agentIds.map(({ id }) => ({
        id,
        operations: CONFIGURATION_1_OPERATIONS_1
      }))))
      .then((result) => agentIds.map((agent, idx) => {
        expect(result[idx].id).to.be.equal(agent.id);
        expect(result[idx].status).to.be.equal(201);
        return client.deleteAgentBulk(agentIds);
      }))
      .then((deletions) => Promise.allSettled(deletions));
  });

  // TODO: unskip this.
  // timeout is more than 100s
  it.skip('addAgentContextOperationsBulk: should work with 10 agents with large number of operations', function() {
    const agentIds = Array.apply(null, Array(10))
      .map((x, i) => ({ id: `agent${i}_${RUN_ID}` }));
    return client
      .deleteAgentBulk(agentIds)
      .then((deletions) => Promise.allSettled(deletions))
      .catch(() => {})
      .then(() => client.createAgentBulk(agentIds
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))))
      .then(() => client.addAgentContextOperationsBulk(agentIds
        .map(({ id }) => ({ id, operations: CONFIGURATION_1_OPERATIONS_2 }))))
      .then((result) => agentIds.map((agent, idx) => {
        expect(result[idx].id).to.be.equal(agent.id);
        expect(result[idx].status).to.be.equal(201);
      }))
      .then(() => client.deleteAgentBulk(agentIds))
      .then((deletions) => Promise.allSettled(deletions));
  });

  it('addAgentContextOperationsBulk: should succeed with agents with different number of operations', function() {
    this.timeout(100000); // TODO: To be removed.
    const agentIds = [{ id: agentIds[0] }, { id: agentIds[1] }, { id: agentIds[2] }];
    return client.deleteAgentBulk(agentIds)
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(
        agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      ))
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
        return client.deleteAgentBulk(agentIds);
      })
      .then((deletions) => Promise.allSettled(deletions));
  });

  it('addAgentContextOperationsBulk: should handle invalid agents', function() {
    const agentIds = [{ id: agentIds[0] }];
    const agentWrongIds = [
      ...agentIds,
      { id: 'john_doe_not_found' },
      { id: 'john?doe' }
    ];
    return client.deleteAgentBulk(agentWrongIds)
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(
        agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      ))
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
        expect(result[2].id).to.be.equal(agentWrongIds[2].id);
        expect(result[2].status).to.be.equal(400);
        expect(result[2].name).to.be.equal('AgentError');

        return client.deleteAgentBulk(agentIds);
      })
      .then((deletions) => Promise.allSettled(deletions));
  });

  it('addAgentContextOperationsBulk: should handle invalid context', function() {
    const agentIds = [{ id: agentIds[0] }, { id: agentIds[1] }];
    return client.deleteAgentBulk(agentIds)
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(
        agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      ))
      .then(() => client.addAgentContextOperationsBulk(
        agentIds.map(({ id }) => ({
          id,
          operations: INVALID_CONFIGURATION_1_OPERATIONS_1
        })))
      )
      .then((results) => {
        results.map((agent_res, idx) => {
          expect(agent_res.id).to.be.equal(agentIds[idx].id);
          expect(agent_res.status).to.be.equal(400);
          expect(agent_res.name).to.be.equal('InvalidPropertyValue');
        });
      })
      .then(() => client.deleteAgentBulk(agentIds))
      .then((deletions) => Promise.allSettled(deletions));
  });

  // getAgentDecisionTreeBulk
  it('getAgentDecisionTreeBulk: should work with two valid agents', function() {
    const agentIds = [{ id: agentIds[0] }, { id: agentIds[1] }];
    return client.deleteAgentBulk(agentIds)
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(
        agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      ))
      .then(() => client.addAgentContextOperationsBulk(
        agentIds.map(({ id }) => ({
          id,
          operations: CONFIGURATION_1_OPERATIONS_1
        })))
      )
      .then(() => client.getAgentDecisionTreeBulk(
        agentIds.map(({ id }) => ({ id, timestamp: TS0 }))
      ))
      .then((agentTrees) => {
        agentTrees.map((agent, idx) => {
          expect(agent.id).to.be.equal(agentIds[idx].id);
          expect(agent.timestamp).to.be.equal(TS0);
          expect(agent).to.be.ok;
          const { _version, configuration, trees } = agent.tree;
          expect(trees).to.be.ok;
          expect(_version).to.be.equal('1.1.0');
          expect(configuration).to.be.deep.equal(CONFIGURATION_1);
        });
        return client.deleteAgentBulk(agentIds);
      })
      .then((deletions) => Promise.allSettled(deletions));
  });

  it('getAgentDecisionTreeBulk: should handle unvalid agents ids', function() {
    const agentIds = [{ id: agentIds[0] }, { id: agentIds[2] }];
    const agentWrongIds = [...agentIds, { id: 'w3!rD_[D' }];
    return client.deleteAgentBulk(agentIds)
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(agentIds.map(({ id }) =>
        ({ id, configuration: CONFIGURATION_1 })))
      )
      .then(() => client.addAgentContextOperationsBulk(agentIds.map(({ id }) => ({
        id,
        operations: CONFIGURATION_1_OPERATIONS_1
      }))))
      .then(() => client.getAgentDecisionTreeBulk(agentWrongIds
        .map(({ id }) => ({ id, timestamp: TS0 }))))
      .then((agentTrees) => {
        agentTrees.map((agent, idx) => {
          expect(agent.id).to.be.equal(agentWrongIds[idx].id);
          expect(agent.timestamp).to.be.equal(TS0);
        });
        agentIds.map((agent, idx) => {
          expect(agentTrees[idx]).to.be.ok;
          const { _version, configuration, trees } = agentTrees[idx].tree;
          expect(trees).to.be.ok;
          expect(_version).to.be.equal('1.1.0');
          expect(configuration).to.be.deep.equal(CONFIGURATION_1);
        });
        expect(agentTrees[2].status).to.be.equal(400);
        expect(agentTrees[2].name).to.be.equal('AgentError');

        return client.deleteAgentBulk(agentIds);
      })
      .then((deletions) => Promise.allSettled(deletions));
  });

  it('getAgentDecisionTreeBulk: should handle several timestamps', function() {
    const timestamps = [TS0, TS0 + 1000, TS0 + 2000];
    return client.deleteAgent(agentIds[0])
      .then(() => client.createAgentBulk([{
        id: agentIds[0], configuration: CONFIGURATION_1
      }]))
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

        return client.deleteAgent(agentIds[0]);
      });
  });

  it('getAgentDecisionTreeBulk: should handle invalid timestamps', function() {
    const timestamps = [TS0, 'INVALID_TIMESTAMP'];
    return client.deleteAgent(agentIds[0])
      .then(() => client.createAgentBulk([{
        id: agentIds[0], configuration: CONFIGURATION_1
      }]))
      .then(() => client.addAgentContextOperationsBulk([{
        id: agentIds[0],
        operations: CONFIGURATION_1_OPERATIONS_1
      }]))
      .then(() => client.getAgentDecisionTreeBulk(timestamps
        .map((timestamp) => ({ id: agentIds[0], timestamp }))))
      .then((agentTrees) => {
        agentTrees.map((agent, idx) => {
          expect(agent.id).to.be.equal(agentIds[0]);
          expect(agent.timestamp).to.be.equal(timestamps[idx]);
        });
        const { _version, configuration, trees } = agentTrees[0].tree;
        expect(trees).to.be.ok;
        expect(_version).to.be.equal('1.1.0');
        expect(configuration).to.be.deep.equal(CONFIGURATION_1);
        expect(agentTrees[1].status).to.be.equal(400);
        expect(agentTrees[1].name).to.be.equal('ContextError');

        return client.deleteAgent(agentIds[0]);
      });
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
      })
      .then(() => Promise.all([
        client.deleteGenerator(generatorIds[0]),
        client.deleteGenerator(generatorIds[1])
      ]));
  });

  it('createGeneratorBulk: should handle invalid configuration', function() {
    return client
      .deleteGeneratorBulk([
        { id: generatorIds[0] },
        { id: generatorIds[1] }
      ])
      .then(() => client.createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { id: generatorIds[1], configuration: CONFIGURATION_1 }
      ]))
      .then(() => client.getGenerator(generatorIds[0]))
      .then((generator) => {
        expect(generator.id).to.be.equal(generatorIds[0]);
        expect(generator.configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
      })
      .then(() => client.getGenerator(generatorIds[1]))
      .catch((err) => {
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      })
      .then(() => client.deleteGenerator(generatorIds[0]));
  });

  it('createGeneratorBulk: should handle undefined configuration', function() {
    return client
      .deleteGeneratorBulk([
        { id: generatorIds[0] },
        { id: generatorIds[1] }
      ])
      .then(() => client.createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { id: generatorIds[1] }
      ]))
      .then(() => client.getGenerator(generatorIds[0]))
      .then((generator) => {
        expect(generator.id).to.be.equal(generatorIds[0]);
        expect(generator.configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
      })
      .then(() => client.getGenerator(generatorIds[1]))
      .catch((err) => {
        expect(err.name).to.be.equal('CraftAiBadRequestError');
      })
      .then(() => client.deleteGenerator(generatorIds[0]));
  });

  it('createGeneratorBulk: should handle undefined id', function() {
    return client
      .deleteGeneratorBulk([{ id: generatorIds[0] }])
      .then(() => client.createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { configuration: CONFIGURATION_1_GENERATOR }
      ]))
      .then((generators) => {
        expect(generators[0].id).to.be.equal(generatorIds[0]);
        expect(generators[0].configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
        expect(generators[1].status).to.be.equal(400);
        expect(generators[1].name).to.be.equal('GeneratorError');
      })
      .then(() => client.deleteGenerator(generatorIds[0]));
  });

  it('createGeneratorBulk: should 200 then 400 when using the same id twice', function() {
    return client
      .deleteGeneratorBulk([{ id: generatorIds[0] }])
      .then(() => client.createGeneratorBulk([
        { id: generatorIds[0], configuration: CONFIGURATION_1_GENERATOR },
        { id: generatorIds[0], configuration: CONFIGURATION_1 }
      ]))
      .then((generators) => {
        expect(generators[0].id).to.be.equal(generatorIds[0]);
        expect(generators[0].configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
        expect(generators[1].status).to.be.equal(400);
        expect(generators[1].name).to.be.equal('ContextError');
      })
      .then(() => client.deleteGenerator(generatorIds[0]));
  });

  // deleteGeneratorBulk
  it('deleteGeneratorBulk: should succeed when using valid ids.', function() {
    const generatorIds = [
      { id: generatorIds[0] },
      { id: generatorIds[1] },
      { id: generatorIds[2] }
    ];
    const expectedResults = [
      { message: `Generator "${generatorIds[0]}" doesn't exist (or was already deleted).` },
      { message: `Generator "${generatorIds[1]}" doesn't exist (or was already deleted).` },
      { message: `Generator "${generatorIds[2]}" doesn't exist (or was already deleted).` }
    ];
    return client.deleteGeneratorBulk(generatorIds)
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createGeneratorBulk(
        generatorIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))
      ))
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
      .then(() => client.deleteGeneratorBulk(generatorIds))
      .then((deletions) => deletions
        .map((generator, i) => {
          expect(generator.id).to.be.equal(generatorIds[i].id);
          expect(generator.configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
        })
      )
      .then(() => client.deleteGeneratorBulk(generatorIds))
      .then((generatorsList_redelete) => {
        expect(generatorsList_redelete).to.be.deep.equal(expectedResults);
      });
  });

  it('deleteGeneratorBulk: Error for unvalid id.', function() {
    const generatorIds = [{ id: '' }];
    return client.deleteGeneratorBulk(generatorIds)
      .then((res) => {
        expect(res[0].name).to.be.equal('GeneratorError');
        expect(res[0].status).to.be.equal(400);
      });
  });

  it('deleteGeneratorBulk: should fail with non existing id.', function() {
    const generatorIds = [{ id: 'toto_non_existing' }];
    return client.deleteGeneratorBulk(generatorIds)
      .then((res) => {
        expect(res[0].message).to.be.equal('Generator "toto_non_existing" doesn\'t exist (or was already deleted).');
      });
  });

  // getGeneratorDecisionTreeBulk
  it('getGeneratorDecisionTreeBulk: should work with two valid generators', function() {
    const generatorIds = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIds = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client.deleteGeneratorBulk(generatorIds)
      .then(() => client.deleteAgentBulk(agentIds))
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(agentIds
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))))
      .then(() => client.addAgentContextOperationsBulk(agentIds
        .map(({ id }) => ({ id, operations: CONFIGURATION_1_OPERATIONS_1 }))))
      .then(() => client.createGeneratorBulk(generatorIds
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))))
      .then(() => client.getGeneratorDecisionTreeBulk(generatorIds
        .map(({ id }) => ({ id, timestamp: 1464600500 }))))
      .then((trees) => {
        trees.map((metatree) => {
          const { tree, timestamp } = metatree;
          expect(timestamp).to.be.equal(1464600500);
          expect(tree._version).to.be.equal('1.1.0');
          expect(tree.trees).to.be.ok;
        });
        return client.deleteAgentBulk(agentIds)
          .then((deletions) => Promise.allSettled(deletions))
          .then(() => client.deleteGeneratorBulk(generatorIds));
      });
  });

  it('getGeneratorDecisionTreeBulk: with non-existing generators', function() {
    const generatorIds = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIds = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client.deleteGeneratorBulk(generatorIds)
      .then(() => client.deleteAgentBulk(agentIds))
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(agentIds
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))))
      .then(() => client.addAgentContextOperationsBulk(agentIds
        .map(({ id }) => ({ id, operations: CONFIGURATION_1_OPERATIONS_1 }))))
      .then(() => client.createGeneratorBulk(generatorIds
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))))
      .then(() => client.getGeneratorDecisionTreeBulk(generatorIds
        .map(() => ({ id: 'non-existing', timestamp: 1464600500 }))))
      .then((results) => {
        results.map((result) => {
          expect(result.name).to.be.equal('NotFound');
          expect(result.status).to.be.equal(404);
        });
        return client.deleteAgentBulk(agentIds)
          .then((deletions) => Promise.allSettled(deletions))
          .then(() => client.deleteGeneratorBulk(generatorIds));
      });
  });

  it('getGeneratorDecisionTreeBulk: mixed results with one existing and one non-exsiting generators', function() {
    const generatorIds = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIds = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client.deleteGeneratorBulk(generatorIds)
      .then(() => client.deleteAgentBulk(agentIds))
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(agentIds
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))))
      .then(() => client.addAgentContextOperationsBulk(agentIds
        .map(({ id }) => ({ id, operations: CONFIGURATION_1_OPERATIONS_1 }))))
      .then(() => client.createGeneratorBulk(generatorIds
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
        return client.deleteAgentBulk(agentIds)
          .then((deletions) => Promise.allSettled(deletions))
          .then(() => client.deleteGeneratorBulk(generatorIds));
      });
  });

  it('getGeneratorDecisionTreeBulk: mixed results with one without contextops', function() {
    const generatorIds = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIds = [{ id: agentIds[0] }, { id: agentIds[1] }];
    const configuration_custom_1 = JSON.parse(JSON.stringify(CONFIGURATION_1_GENERATOR));
    configuration_custom_1.filter = [agentIds[0]];
    const configuration_custom_2 = JSON.parse(JSON.stringify(CONFIGURATION_1_GENERATOR));
    configuration_custom_2.filter = [agentIds[1]];

    return client.deleteGeneratorBulk(generatorIds)
      .then(() => client.deleteAgentBulk(agentIds))
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(agentIds
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))))
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
        return client.deleteAgentBulk(agentIds)
          .then((deletions) => Promise.allSettled(deletions))
          .then(() => client.deleteGeneratorBulk(generatorIds));
      });
  });

  it('getGeneratorDecisionTreeBulk: should fail without contextops', function() {
    const generatorIds = [{ id: generatorIds[0] }, { id: generatorIds[1] }];
    const agentIds = [{ id: agentIds[0] }, { id: agentIds[1] }];

    return client.deleteGeneratorBulk(generatorIds)
      .then(() => client.deleteAgentBulk(agentIds))
      .then((deletions) => Promise.allSettled(deletions))
      .then(() => client.createAgentBulk(agentIds
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))))
      .then(() => client.createGeneratorBulk(generatorIds
        .map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))))
      .then(() => client.getGeneratorDecisionTreeBulk(generatorIds
        .map(({ id }) => ({ id, timestamp: 1464600500 }))))
      .then(([res1, res2]) => {
        expect(res1.id).to.be.equal(generatorIds[0]);
        expect(res1.name).to.be.equal('InternalError');
        expect(res1.status).to.be.equal(500);
        expect(res2.id).to.be.equal(generatorIds[1]);
        expect(res2.name).to.be.equal('InternalError');
        expect(res2.status).to.be.equal(500);
        return client.deleteAgentBulk(agentIds)
          .then((deletions) => Promise.allSettled(deletions))
          .then(() => client.deleteGeneratorBulk(generatorIds));
      });
  });
});
