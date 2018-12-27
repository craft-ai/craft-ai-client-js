import CONFIGURATION_1 from './data/configuration_1.json';
import CONFIGURATION_1_OPERATIONS_1 from './data/configuration_1_operations_1.json';
import CONFIGURATION_1_OPERATIONS_2 from './data/configuration_1_operations_2.json';
import craftai from '../src';
import INVALID_CONFIGURATION_1 from './data/invalid_configuration_1.json';

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

  // CREATEAGENTS
  it('CREATEAGENTS: should succeed when using valid configurations and generated ids', function() {
    return client
      .createAgents([
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

  it('CREATEAGENTS: should succeed when using valid configurations and a specified id', function() {
    return client.deleteAgents([{ id: 'press_f' }])
      .then(() => {
        return client
          .createAgents([
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

  it('CREATEAGENTS: should succeed when using valid configurations and specified ids', function() {
    return client
      .deleteAgents([{ id: 'press_f' }, { id: 't0' }, { id: 'pay_respects' }])
      .then(() => {
        return client
          .createAgents([
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

  it('CREATEAGENTS: should handle invalid configuration', function() {
    return client.deleteAgents([{ id: 'le_monde_est_sourd' }])
      .then(() => {
        return client
          .createAgents([
            { id: 'le_monde_est_sourd', configuration: CONFIGURATION_1 },
            { id: 'partis_pour_rester', configuration: INVALID_CONFIGURATION_1 }
          ])
          .then((agentsList) => {
            const agent0 = agentsList[0];
            testAgentIntegrity(agent0, 'le_monde_est_sourd', CONFIGURATION_1);
            const agent1 = agentsList[1];
            expect(agent1.status).to.be.equal(400);
            expect(agent1.error).to.be.equal('ContextError');
            agentsList.map(({ id }) => client.deleteAgent(id));
          });
      });
  });

  it('CREATEAGENTS: should handle undefined configuration', function() {
    return client.deleteAgents([{ id: 'leila_et_les_chasseurs' }])
      .then(() => {
        return client
          .createAgents([
            { id: 'leila_et_les_chasseurs', configuration: CONFIGURATION_1 },
            { id: 'la_robe_et_lechelle', configuration: undefined }
          ])
          .then((agentsList) => {
            const agent0 = agentsList[0];
            testAgentIntegrity(agent0, 'leila_et_les_chasseurs', CONFIGURATION_1);
            const agent1 = agentsList[1];
            expect(agent1.status).to.be.equal(400);
            expect(agent1.error).to.be.equal('ContextError');
            agentsList.map(({ id }) => client.deleteAgent(id));
          });
      });
  });

  it('CREATEAGENTS: should handle invalid id', function() {
    return client
      .createAgents([
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

  it('CREATEAGENTS: should 200 then 400 when using the same id twice', function() {
    const agentId = 'francis_cabrel';
    return client.deleteAgents([{ id: agentId }])
      .then(() => {
        return client
          .createAgents([{ id: agentId, configuration: CONFIGURATION_1 }])
          .then((agentsList0) => {
            agentsList0.map((agent) =>
              testAgentIntegrity(agent, agentId, CONFIGURATION_1)
            );
          })
          .then(() => {
            client
              .createAgents([{ id: agentId, configuration: CONFIGURATION_1 }])
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

  it('CREATEAGENTS: should return array of 200 and 400 if has mixed results', function() {
    return client
      .deleteAgents([{ id: 'encore_et_encore' }, { id: 'petite_marie' }])
      .then(() =>
        client
          .createAgents([
            { id: 'encore_et_encore', configuration: CONFIGURATION_1 }
          ])
          .then((agentsList0) => {
            agentsList0.map((agent) =>
              testAgentIntegrity(agent, agent.id, CONFIGURATION_1)
            );
            client
              .createAgents([
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

  // DELETEAGENTS
  it('DELETEAGENTS: should succeed when using valid ids.', function() {
    const agentIds = [
      { id: 'wild_horses' },
      { id: 'way_to_rome' },
      { id: 'postcards' }
    ];
    return client.deleteAgents(agentIds)
      .then(() =>
        client
          .createAgents(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then((agentsList0) => {
            agentsList0.map((agent, idx) => {
              testAgentIntegrity(agent, agentIds[idx].id, CONFIGURATION_1);
            });
            return client.deleteAgents(agentIds)
              .then((agentsList1) => {
                agentsList1.map((agent, idx) => {
                  expect(agent.id).to.be.equal(agentIds[idx].id);
                  expect(agent.configuration).to.be.deep.equal(CONFIGURATION_1);
                });
                return client.deleteAgents(agentIds)
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

  it('DELETEAGENTS: should handle undefined id', function() {
    const agentIds = [{ id: '7$ shopping' }, {}, { id: undefined }];
    return client.deleteAgents(agentIds)
      .then((del_res) => {
        expect(del_res[0]).to.be.deep.equal(agentIds[0]);
        expect(del_res[1].status).to.be.equal(400);
        expect(del_res[1].error).to.be.equal('ContextError');
        expect(del_res[2].status).to.be.equal(400);
        expect(del_res[2].error).to.be.equal('ContextError');
      });
  });

  // ADDCONTEXT
  it('ADDCONTEXT: should work with 50 agents with small number of operations', function() {
    const agentIds = Array.apply(null, Array(50))
      .map((x, i) => ({
        id: `agent${i}`
      }));
    return client.deleteAgents(agentIds)
      .then(() =>
        client
          .createAgents(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then(() =>
            client
              .addAgentsContextOperations(
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
                client.deleteAgents(agentIds);
              })
          )
      );
  });

  it('ADDCONTEXT: should work with 50 agents with large number of operations', function() {
    const agentIds = Array.apply(null, Array(50))
      .map((x, i) => ({
        id: `agent${i}`
      }));
    return client.deleteAgents(agentIds)
      .then(() =>
        client
          .createAgents(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then(() =>
            client
              .addAgentsContextOperations(
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
                client.deleteAgents(agentIds);
              })
          )
      );
  });

  it('ADDCONTEXT: should work with agents with different number of operations', function() {
    const agentIds = [{ id: 'agent0' }, { id: 'agent1' }, { id: 'agent2' }];
    return client.deleteAgents(agentIds)
      .then(() =>
        client
          .createAgents(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then(() =>
            client
              .addAgentsContextOperations([
                { id: 'agent0', operations: CONFIGURATION_1_OPERATIONS_1 }, // S
                { id: 'agent1', operations: CONFIGURATION_1_OPERATIONS_2 }, // large
                { id: 'agent2', operations: CONFIGURATION_1_OPERATIONS_1 } // S
              ])
              .then((result) => {
                expect(result[0].id).to.be.equal('agent1');
                expect(result[1].id).to.be.equal('agent0');
                expect(result[2].id).to.be.equal('agent2');
                result.map(({ status }) => expect(status).to.be.equal(201));
                client.deleteAgents(agentIds);
              })
          )
      );
  });

  // tester des agents invalides pour le context
  // tester des agents invalides pour les compute decision trees

  // GETAGENTSDECISIONTREES
  it('GETAGENTSDECISIONTREES: should work with two valid agents', function() {
    const agentIds = [{ id: 'charlotte_cardin' }, { id: 'ben_harper' }];
    const timestamp = 1464601500;
    return client.deleteAgents(agentIds)
      .then(() =>
        client
          .createAgents(
            agentIds.map(({ id }) => ({ id, configuration: CONFIGURATION_1 }))
          )
          .then(() =>
            client
              .addAgentsContextOperations(
                agentIds.map(({ id }) => ({
                  id,
                  operations: CONFIGURATION_1_OPERATIONS_1
                }))
              )
              .then(() =>
                client
                  .getAgentsDecisionTrees(
                    agentIds.map(({ id }) => ({ id, timestamp }))
                  )
                  .then((agentTrees) => {
                    agentTrees.map((agent, idx) => {
                      expect(agent.id).to.be.equal(agentIds[idx].id);
                      expect(agent.timestamp).to.be.equal(timestamp);
                      expect(agent).to.be.ok;
                      const { _version, configuration, trees } = agent.tree;
                      expect(trees).to.be.ok;
                      expect(_version).to.be.ok;
                      expect(configuration).to.be.deep.equal(CONFIGURATION_1);
                    });
                    return client.deleteAgents(agentIds);
                  })
              )
          )
      );
  });
});
