import CONFIGURATION_1 from './data/configuration_1.json';

import craftai, { errors } from '../src';
import INVALID_CONFIGURATION_1 from './data/invalid_configuration_1.json';

describe('BULK: client.createAgents([{id, <configuration>}, {<configuration>}, ...])', function() {
  let client;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });

  function testAgentIntegrity(agent, agentId, configuration) {
    expect(agent).to.be.ok;
    expect(agent.id).to.be.equal(agentId);
    expect(agent.status).to.not.be.equal(400);
    return client.getAgent(agent.id).then((retrieveAgent) => {
      expect(retrieveAgent.configuration).to.be.deep.equal(configuration);
    });
  }

  it('should succeed when using valid configurations and generated ids', function() {
    return client
      .createAgents([
        { configuration: CONFIGURATION_1 },
        { configuration: CONFIGURATION_1 }
      ])
      .then((res_list) => {
        res_list.map((agent) => {
          testAgentIntegrity(agent, agent.id, CONFIGURATION_1);
          return client.deleteAgent(agent.id);
        });
      });
  });

  it('should succeed when using valid configurations and a specified id', function() {
    return client
      .createAgents([
        { id: 'press_f', configuration: CONFIGURATION_1 },
        { configuration: CONFIGURATION_1 }
      ])
      .then((res_list) => {
        res_list.map((agent) => {
          testAgentIntegrity(agent, agent.id, CONFIGURATION_1);
          return client.deleteAgent(agent.id);
        });
      });
  });

  it('should succeed when using valid configurations and specified ids', function() {
    return client
      .createAgents([
        { id: 'press_f', configuration: CONFIGURATION_1 },
        { id: 't0', configuration: CONFIGURATION_1 },
        { id: 'pay_respects', configuration: CONFIGURATION_1 }
      ])
      .then((res_list) => {
        res_list.map((agent) => {
          testAgentIntegrity(agent, agent.id, CONFIGURATION_1);
          return client.deleteAgent(agent.id);
        });
      });
  });

  // test with wrong id

  // ATTENTION A BIEN UTILISER LA FUNCTION TEST AGENT INTEGRITY

  it('should 200 then 400 when using the same id twice', function() {
    const agentId = 'francis_cabrel';
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

  it('should return array of 200 and 400 if has mixed results', function() {
    return client
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
      });
  });

  it('should handle invalid configuration', function() {
    return client
      .createAgents([
        { id: 'le_monde_est_sourd', configuration: CONFIGURATION_1 },
        { configuration: INVALID_CONFIGURATION_1 }
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

  it('should handle undefined configuration', function() {
    return client
      .createAgents([
        { id: 'leila_et_les_chasseurs', configuration: CONFIGURATION_1 },
        { configuration: undefined }
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

  it('should handle invalid id', function() {
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
});
