import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_GENERATOR from './data/configuration_1_generator.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import CONFIGURATION_1_OPERATIONS_2 from './data/configuration_1_operations_2.json';
import craftai from '../src';
import INVALID_CONFIGURATION_1 from './data/invalid_configuration_1.json';
import INVALID_CONFIGURATION_1_OPERATIONS_1 from './data/invalid_configuration_1_operations_1.json';
import { expect } from 'chai';

describe('BULK:', function() {
  let client;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });

  function testAgentIntegrity(agent, agentId, configuration) {
    expect(agent).to.be.ok;
    expect(agent.id).to.be.equal(agentId);
    expect(agent.status).to.not.be.equal(400);
    return client.getAgent(agent.id)
      .then((retrieveAgent) => {
        expect(retrieveAgent.configuration).to.be.deep.equal(configuration);
      });
  }

  function testGeneratorIntegrity(generator, generatorId, configuration) {
    expect(generator).to.be.ok;
    expect(generator.id).to.be.equal(generatorId);
    expect(generator.status).to.not.be.equal(400);
    return client.getGenerator(generator.id)
      .then((retrieveGenerator) => {
        expect(retrieveGenerator.configuration).to.be.deep.equal(configuration);
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
      .then((agentsList) => {
        agentsList.map((agent) => {
          testAgentIntegrity(agent, agent.id, CONFIGURATION_1);
          return client.deleteAgent(agent.id);
        });
      });
  });

  it('createAgentBulk: should succeed when using valid configurations and a specified id', function() {
    return client.deleteAgentBulk([{ id: 'press_f' }])
      .then(() => {
        return client
          .createAgentBulk([
            { id: 'press_f', configuration: CONFIGURATION_1 },
            { configuration: CONFIGURATION_1 }
          ])
          .then((agentsList) => {
            agentsList.map((agent) => {
              testAgentIntegrity(agent, agent.id, CONFIGURATION_1);
              return client.deleteAgent(agent.id);
            });
          });
      });
  });

  it('createAgentBulk: should succeed when using valid configurations and specified ids', function() {
    return client
      .deleteAgentBulk([{ id: 'press_f' }, { id: 't0' }, { id: 'pay_respects' }])
      .then(() => {
        return client
          .createAgentBulk([
            { id: 'press_f', configuration: CONFIGURATION_1 },
            { id: 't0', configuration: CONFIGURATION_1 },
            { id: 'pay_respects', configuration: CONFIGURATION_1 }
          ])
          .then((agentsList) => {
            agentsList.map((agent) => {
              testAgentIntegrity(agent, agent.id, CONFIGURATION_1);
              return client.deleteAgent(agent.id);
            });
          });
      });
  });

  it('createAgentBulk: should handle invalid configuration', function() {
    return client
      .deleteAgentBulk([
        { id: 'le_monde_est_sourd' },
        { id: 'partis_pour_rester' }
      ])
      .then(() => {
        return client
          .createAgentBulk([
            { id: 'le_monde_est_sourd', configuration: CONFIGURATION_1 },
            { id: 'partis_pour_rester', configuration: INVALID_CONFIGURATION_1 }
          ])
          .then((agentsList) => {
            const agent0 = agentsList[0];
            return testAgentIntegrity(agent0, 'le_monde_est_sourd', CONFIGURATION_1)
              .then(() => {
                const agent1 = agentsList[1];
                expect(agent1.status).to.be.equal(400);
                expect(agent1.error).to.be.equal('ContextError');
                agentsList.map(({ id }) => client.deleteAgent(id));
              });
          });
      });
  });

  it('createAgentBulk: should handle undefined configuration', function() {
    return client
      .deleteAgentBulk([
        { id: 'leila_et_les_chasseurs' },
        { id: 'la_robe_et_lechelle' }
      ])
      .then(() => {
        return client
          .createAgentBulk([
            { id: 'leila_et_les_chasseurs', configuration: CONFIGURATION_1 },
            { id: 'la_robe_et_lechelle', configuration: undefined }
          ])
          .then((agentsList) => {
            const agent0 = agentsList[0];
            testAgentIntegrity(
              agent0,
              'leila_et_les_chasseurs',
              CONFIGURATION_1
            );
            const agent1 = agentsList[1];
            expect(agent1.status).to.be.equal(400);
            expect(agent1.error).to.be.equal('ContextError');
            agentsList.map(({ id }) => client.deleteAgent(id));
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
        testAgentIntegrity(agent0, agent0.id, CONFIGURATION_1);

        const agent1 = agentsList[1];
        expect(agent1.id).to.be.equal('francis?cabrel');
        expect(agent1.status).to.be.equal(400);
        expect(agent1.error).to.be.equal('AgentError');

        client.deleteAgent(agent0.id);
      });
  });

  it('createAgentBulk: should 200 then 400 when using the same id twice', function() {
    const agentId = 'francis_cabrel';
    return client.deleteAgentBulk([{ id: agentId }])
      .then(() => {
        return client
          .createAgentBulk([{ id: agentId, configuration: CONFIGURATION_1 }])
          .then((agentsList0) => {
            agentsList0.map((agent) =>
              testAgentIntegrity(agent, agentId, CONFIGURATION_1)
            );
          })
          .then(() => {
            client
              .createAgentBulk([{ id: agentId, configuration: CONFIGURATION_1 }])
              .then((agentsList1) => {
                agentsList1.map((agent) => {
                  expect(agent).to.be.ok;
                  expect(agent.id).to.be.equal(agentId);
                  expect(agent.status).to.be.equal(400);
                });
              });
          })
          .then(() => client.deleteAgent(agentId));
      });
  });

  it('createAgentBulk: should return array of 200 and 400 if has mixed results', function() {
    return client
      .deleteAgentBulk([{ id: 'encore_et_encore' }, { id: 'petite_marie' }])
      .then(() =>
        client
          .createAgentBulk([
            { id: 'encore_et_encore', configuration: CONFIGURATION_1 }
          ])
          .then((agentsList0) => {
            agentsList0.map((agent) =>
              testAgentIntegrity(agent, agent.id, CONFIGURATION_1)
            );
            client
              .createAgentBulk([
                { id: 'encore_et_encore', configuration: CONFIGURATION_1 },
                { id: 'petite_marie', configuration: CONFIGURATION_1 }
              ])
              .then((agentsList1) => {
                const agent0 = agentsList1[0];
                const agent1 = agentsList1[1];
                expect(agent0.id).to.be.equal('encore_et_encore');
                expect(agent1.id).to.be.equal('petite_marie');
                expect(agent0.status).to.be.equal(400);
                expect(agent0.error).to.be.equal('ContextError');
                agentsList1.map(({ id }) => client.deleteAgent(id));
              });
          })
      );
  });

  // deleteAgentBulk
  it('deleteAgentBulk: should succeed when using valid ids.', function() {
    const agentIds = [
      { id: 'wild_horses' },
      { id: 'way_to_rome' },
      { id: 'postcards' }
    ];
    return client.deleteAgentBulk(agentIds)
      .then(() =>
        client
          .createAgentBulk(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then((agentsList0) => {
            agentsList0.map((agent, idx) => {
              testAgentIntegrity(agent, agentIds[idx].id, CONFIGURATION_1);
            });
            return client.deleteAgentBulk(agentIds)
              .then((agentsList1) => {
                agentsList1.map((agent, idx) => {
                  expect(agent.id).to.be.equal(agentIds[idx].id);
                  expect(agent.configuration).to.be.deep.equal(CONFIGURATION_1);
                });
                return client.deleteAgentBulk(agentIds)
                  .then((agentsList2) => {
                    agentsList2.map((agent, idx) => {
                      expect(agent.id).to.be.equal(agentIds[idx].id);
                      expect(agent.configuration).to.be.equal(undefined);
                    });
                  });
              });
          })
      );
  });

  it.skip('deleteAgentBulk: should handle undefined id', function() {
    const agentIds = [{ id: '7$ shopping' }, {}, { id: undefined }];
    return client.deleteAgentBulk(agentIds)
      .then((del_res) => {
        expect(del_res[0].id).to.be.equal(agentIds[0].id);
        expect(del_res[0].status).to.be.equal(400);
        expect(del_res[0].error).to.be.equal('AgentError');
        expect(del_res[1].status).to.be.equal(400);
        expect(del_res[1].error).to.be.equal('ContextError');
        expect(del_res[2].status).to.be.equal(400);
        expect(del_res[2].error).to.be.equal('ContextError');
      });
  });

  // addAgentContextOperationsBulk
  it('addAgentContextOperationsBulk: should work with 10 agents with small number of operations', function() {
    const agentIds = Array.apply(null, Array(10))
      .map((x, i) => ({
        id: `agent${i}`
      }));
    return client
      .deleteAgentBulk(agentIds)
      .then(() =>
        client
          .createAgentBulk(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then(() =>
            client
              .addAgentContextOperationsBulk(
                agentIds.map(({ id }) => ({
                  id,
                  operations: CONFIGURATION_1_OPERATIONS_1
                }))
              )
              .then((result) => {
                agentIds.map((agent, idx) => {
                  expect(result[idx].id).to.be.equal(agent.id);
                  expect(result[idx].status).to.be.equal(201);
                });
                client.deleteAgentBulk(agentIds);
              })
          )
      )
      .catch((err) => {
        if (err.response) {
          throw new Error(err.response.body.message);
        }
        throw err;
      });
  });

  it('addAgentContextOperationsBulk: should work with 10 agents with large number of operations', function() {
    const agentIds = Array.apply(null, Array(10))
      .map((x, i) => ({
        id: `agent${i}`
      }));
    return client
      .deleteAgentBulk(agentIds)
      .then(() =>
        client
          .createAgentBulk(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then(() =>
            client
              .addAgentContextOperationsBulk(
                agentIds.map(({ id }) => ({
                  id,
                  operations: CONFIGURATION_1_OPERATIONS_2
                }))
              )
              .then((result) => {
                agentIds.map((agent, idx) => {
                  expect(result[idx].id).to.be.equal(agent.id);
                  expect(result[idx].status).to.be.equal(201);
                });
                client.deleteAgentBulk(agentIds);
              })
          )
      )
      .catch((err) => {
        if (err.response) {
          throw new Error(err.response.body.message);
        }
        throw err;
      });
  });

  it('addAgentContextOperationsBulk: should succeed with agents with different number of operations', function() {
    const agentIds = [{ id: 'agent0' }, { id: 'agent1' }, { id: 'agent2' }];
    return client.deleteAgentBulk(agentIds)
      .then(() =>
        client
          .createAgentBulk(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then(() =>
            client
              .addAgentContextOperationsBulk([
                { id: 'agent0', operations: CONFIGURATION_1_OPERATIONS_1 }, // S
                { id: 'agent1', operations: CONFIGURATION_1_OPERATIONS_2 }, // large
                { id: 'agent2', operations: CONFIGURATION_1_OPERATIONS_1 } // S
              ])
              .then((result) => {
                expect(result[0].id).to.be.equal('agent1');
                expect(result[1].id).to.be.equal('agent0');
                expect(result[2].id).to.be.equal('agent2');
                result.map(({ status }) => expect(status).to.be.equal(201));
                client.deleteAgentBulk(agentIds);
              })
          )
      );
  });

  it('addAgentContextOperationsBulk: should handle invalid agents', function() {
    const agentIds = [{ id: 'john_doe' }];
    const agentWrongIds = [
      ...agentIds,
      { id: 'john_doe_not_found' },
      { id: 'john?doe' }
    ];
    return client.deleteAgentBulk(agentWrongIds)
      .then(() =>
        client
          .createAgentBulk(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then((res) => {
            client
              .addAgentContextOperationsBulk(
                agentWrongIds.map(({ id }) => ({
                  id,
                  operations: CONFIGURATION_1_OPERATIONS_1
                }))
              )
              .then((result) => {
                expect(result[0].id).to.be.equal(agentWrongIds[0].id);
                expect(result[0].status).to.be.equal(201);
                expect(result[1].id).to.be.equal(agentWrongIds[1].id);
                expect(result[1].status).to.be.equal(404);
                expect(result[1].error).to.be.equal('NotFound');
                expect(result[2].id).to.be.equal(agentWrongIds[2].id);
                expect(result[2].status).to.be.equal(400);
                expect(result[2].error).to.be.equal('AgentError');

                client.deleteAgentBulk(agentIds);
              });
          })
      );
  });

  it('addAgentContextOperationsBulk: should handle invalid context', function() {
    const agentIds = [{ id: 'John_Lemon' }, { id: 'Insane_Bane' }];
    return client.deleteAgentBulk(agentIds)
      .then(() =>
        client.createAgentBulk(
          agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
        )
          .then((res) => client.addAgentContextOperationsBulk(
            agentIds.map(({ id }) => ({
              id,
              operations: INVALID_CONFIGURATION_1_OPERATIONS_1
            }))
          )
            .then((results) => {
              results.map((agent_res, idx) => {
                expect(agent_res.id).to.be.equal(agentIds[idx].id);
                expect(agent_res.status).to.be.equal(500);
                expect(agent_res.error).to.be.equal('InvalidPropertyValue');
              });
            })
            .then(() => client.deleteAgentBulk(agentIds))
          )
      );
  });

  // getAgentDecisionTreeBulk
  it('getAgentDecisionTreeBulk: should work with two valid agents', function() {
    const agentIds = [{ id: 'charlotte_cardin' }, { id: 'ben_harper' }];
    return client.deleteAgentBulk(agentIds)
      .then(() =>
        client
          .createAgentBulk(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then(() =>
            client
              .addAgentContextOperationsBulk(
                agentIds.map(({ id }) => ({
                  id,
                  operations: CONFIGURATION_1_OPERATIONS_1
                }))
              )
              .then(() =>
                client
                  .getAgentDecisionTreeBulk(
                    agentIds.map(({ id }) => ({ id, timestamp: TS0 }))
                  )
                  .then((agentTrees) => {
                    agentTrees.map((agent, idx) => {
                      expect(agent.id).to.be.equal(agentIds[idx].id);
                      expect(agent.timestamp).to.be.equal(TS0);
                      expect(agent).to.be.ok;
                      const { _version, configuration, trees } = agent.tree;
                      expect(trees).to.be.ok;
                      expect(_version).to.be.ok;
                      expect(configuration).to.be.deep.equal(CONFIGURATION_1);
                    });
                    return client.deleteAgentBulk(agentIds);
                  })
              )
          )
      );
  });

  it('getAgentDecisionTreeBulk: should handle unvalid agents ids', function() {
    const agentIds = [{ id: 'twenty_one' }, { id: 'pilots' }];
    const agentWrongIds = [...agentIds, { id: 'w3!rD_[D' }];
    return client.deleteAgentBulk(agentIds)
      .then(() =>
        client
          .createAgentBulk(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then(() =>
            client
              .addAgentContextOperationsBulk(
                agentIds.map(({ id }) => ({
                  id,
                  operations: CONFIGURATION_1_OPERATIONS_1
                }))
              )
              .then(() =>
                client
                  .getAgentDecisionTreeBulk(
                    agentWrongIds.map(({ id }) => ({ id, timestamp: TS0 }))
                  )
                  .then((agentTrees) => {
                    agentTrees.map((agent, idx) => {
                      expect(agent.id).to.be.equal(agentWrongIds[idx].id);
                      expect(agent.timestamp).to.be.equal(TS0);
                    });
                    agentIds.map((agent, idx) => {
                      expect(agentTrees[idx]).to.be.ok;
                      const { _version, configuration, trees } = agentTrees[idx].tree;
                      expect(trees).to.be.ok;
                      expect(_version).to.be.ok;
                      expect(configuration).to.be.deep.equal(CONFIGURATION_1);
                    });
                    expect(agentTrees[2].status).to.be.equal(400);
                    expect(agentTrees[2].error).to.be.equal('AgentError');

                    return client.deleteAgentBulk(agentIds);
                  })
              )
          )
      );
  });

  it('getAgentDecisionTreeBulk: should handle several timestamps', function() {
    const agentId = 'tom_walker';
    const timestamps = [TS0, TS0 + 1000, TS0 + 2000];
    return client.deleteAgent(agentId)
      .then(() =>
        client
          .createAgentBulk([{
            id: agentId, configuration: CONFIGURATION_1
          }])
          .then(() =>
            client
              .addAgentContextOperationsBulk([{
                id: agentId,
                operations: CONFIGURATION_1_OPERATIONS_1
              }])
              .then(() =>
                client
                  .getAgentDecisionTreeBulk(
                    timestamps.map((timestamp) => ({ id: agentId, timestamp }))
                  )
                  .then((agentTrees) => {
                    agentTrees.map((agent, idx) => {
                      expect(agent.id).to.be.equal(agentId);
                      expect(agent.timestamp).to.be.equal(timestamps[idx]);
                      expect(agent).to.be.ok;
                      const { _version, configuration, trees } = agent.tree;
                      expect(trees).to.be.ok;
                      expect(_version).to.be.ok;
                      expect(configuration).to.be.deep.equal(CONFIGURATION_1);
                    });

                    return client.deleteAgent(agentId);
                  })
              )
          )
      );
  });

  it('getAgentDecisionTreeBulk: should handle invalid timestamps', function() {
    const agentId = 'tom_walker';
    const timestamps = [TS0, 'INVALID_TIMESTAMP'];
    return client.deleteAgent(agentId)
      .then(() =>
        client
          .createAgentBulk([{
            id: agentId, configuration: CONFIGURATION_1
          }])
          .then(() =>
            client
              .addAgentContextOperationsBulk([{
                id: agentId,
                operations: CONFIGURATION_1_OPERATIONS_1
              }])
              .then(() =>
                client
                  .getAgentDecisionTreeBulk(
                    timestamps.map((timestamp) => ({ id: agentId, timestamp }))
                  )
                  .then((agentTrees) => {
                    agentTrees.map((agent, idx) => {
                      expect(agent.id).to.be.equal(agentId);
                      expect(agent.timestamp).to.be.equal(timestamps[idx]);
                    });
                    const { _version, configuration, trees } = agentTrees[0].tree;
                    expect(trees).to.be.ok;
                    expect(_version).to.be.ok;
                    expect(configuration).to.be.deep.equal(CONFIGURATION_1);
                    expect(agentTrees[1].status).to.be.equal(400);
                    expect(agentTrees[1].error).to.be.equal('ContextError');

                    return client.deleteAgent(agentId);
                  })
              )
          )
      );
  });

  //bulk generator

  //createGeneratorBulk
  it('createGeneratorBulk: should succeed when using valid configurations and a specified id', function() {
    return client
      .createGeneratorBulk([
        { id: 'generator_1', configuration: CONFIGURATION_1_GENERATOR },
        { id: 'generator_2', configuration: CONFIGURATION_1_GENERATOR }
      ])
      .then((generatorsList) => {
        return generatorsList.map((generator) => {
          testGeneratorIntegrity(generator, generator.id, CONFIGURATION_1_GENERATOR);
          return client.deleteGenerator(generator.id);
        });
      });
  });

  it('createGeneratorBulk: should handle invalid configuration', function() {
    return client
      .deleteGeneratorBulk([
        { id: 'generator_1' },
        { id: 'generator_2' }
      ])
      .then(() => {
        return client
          .createGeneratorBulk([
            { id: 'generator_1', configuration: CONFIGURATION_1_GENERATOR },
            { id: 'generator_2', configuration: CONFIGURATION_1 }
          ])
          .then((generatorsList) => {
            return testGeneratorIntegrity(generatorsList[0], 'generator_1', CONFIGURATION_1_GENERATOR)
              .then(() => {
                expect(generatorsList[1].status).to.be.equal(400);
                expect(generatorsList[1].error).to.be.equal('ContextError');
                generatorsList.map(({ id }) => client.deleteAgent(id));
              });
          });
      });
  });

  it('createGeneratorBulk: should handle undefined configuration', function() {
    return client
      .deleteGeneratorBulk([
        { id: 'generator_1' },
        { id: 'generator_2' }
      ])
      .then(() => {
        return client
          .createGeneratorBulk([
            { id: 'generator_1', configuration: CONFIGURATION_1_GENERATOR },
            { id: 'generator_2' }
          ])
          .then((generatorsList) => {
            return testGeneratorIntegrity(generatorsList[0], 'generator_1', CONFIGURATION_1_GENERATOR)
              .then(() => {
                expect(generatorsList[1].status).to.be.equal(400);
                expect(generatorsList[1].error).to.be.equal('ContextError');
                generatorsList.map(({ id }) => client.deleteAgent(id));
              });
          });
      });
  });

  it('createGeneratorBulk: should handle undefined id', function() {
    return client
      .deleteGeneratorBulk([
        { id: 'generator_1' }
      ])
      .then(() => {
        return client
          .createGeneratorBulk([
            { id: 'generator_1', configuration: CONFIGURATION_1_GENERATOR },
            { configuration: CONFIGURATION_1_GENERATOR }
          ])
          .then((generatorsList) => {
            return testGeneratorIntegrity(generatorsList[0], 'generator_1', CONFIGURATION_1_GENERATOR)
              .then(() => {
                expect(generatorsList[1].status).to.be.equal(400);
                expect(generatorsList[1].error).to.be.equal('GeneratorError');
                client.deleteAgent('generator_1');
              });
          });
      });
  });

  it('createGeneratorBulk: should 200 then 400 when using the same id twice', function() {
    return client
      .deleteGeneratorBulk([
        { id: 'generator_1' }
      ])
      .then(() => {
        return client
          .createGeneratorBulk([
            { id: 'generator_1', configuration: CONFIGURATION_1_GENERATOR },
            { id: 'generator_1', configuration: CONFIGURATION_1 }
          ])
          .then((generatorsList) => {
            return testGeneratorIntegrity(generatorsList[0], 'generator_1', CONFIGURATION_1_GENERATOR)
              .then(() => {
                expect(generatorsList[1].status).to.be.equal(400);
                expect(generatorsList[1].error).to.be.equal('ContextError');
                generatorsList.map(({ id }) => client.deleteAgent(id));
              });
          });
      });
  });

  // deleteGeneratorBulk
  it('deleteGeneratorBulk: should succeed when using valid ids.', function() {
    const generatorIds = [
      { id: 'generator_1' },
      { id: 'generator_2' },
      { id: 'generator_3' }
    ];
    return client.deleteGeneratorBulk(generatorIds)
      .then(() =>
        client
          .createGeneratorBulk(
            generatorIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR }))
          )
      )
      .then((generatorsList_create) => {
        generatorsList_create.map((generator, i) => {
          testAgentIntegrity(generator, generatorIds[i].id, CONFIGURATION_1_GENERATOR);
        });
        return client.deleteGeneratorBulk(generatorIds);
      })
      .then((generatorsList_delete) => {
        generatorsList_delete.map((generator, i) => {
          expect(generator.id).to.be.equal(generatorIds[i].id);
          expect(generator.configuration).to.be.deep.equal(CONFIGURATION_1_GENERATOR);
        });
        return client.deleteGeneratorBulk(generatorIds);
      })
      .then((generatorsList_redelete) => {
        generatorsList_redelete.map((generator, i) => {
          expect(generator.configuration).to.be.equal(undefined);
        });
      });
  });

  it('deleteGeneratorBulk: Error for unvalid id.', function() {
    const generatorIds = [
      { id: '' }
    ];
    return client.deleteGeneratorBulk(generatorIds)
      .then((res) => {
        expect(res[0].name).to.be.equal('GeneratorError');
        expect(res[0].status).to.be.equal(400);
      });
  });

  // getGeneratorDecisionTreeBulk
  it.skip('getGeneratorDecisionTreeBulk: should work with two valid generators', function() {
    const generatorIds = [{ id: 'generator_1' }, { id: 'generator_2' }];
    const agentIds = [{ id: 'agent_1' }, { id: 'agent_2' }];

    return client.deleteGeneratorBulk(generatorIds)
      .then(() => client.deleteAgentBulk(agentIds))
      .then(() => client.createAgentBulk(
        agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
      ))
      .then(() =>
        client.addAgentContextOperationsBulk(
          agentIds.map(({ id }) => ({ id, operations: CONFIGURATION_1_OPERATIONS_1 })))
      )
      .then(() =>
        client.createGeneratorBulk(
          generatorIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1_GENERATOR })))
      )
      .then(() =>
        client.getGeneratorDecisionTreeBulk(
          agentIds.map(({ id }) => ({ id, timestamp: 1464600500 })))
      )
      .then((trees) => {
        trees.map((tree, i) => {
          expect(true);
        });
        return client.deleteAgentBulk(agentIds)
          .then(() => client.deleteGeneratorBulk(generatorIds));
      });
  });
});
