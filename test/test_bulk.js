import CONFIGURATION_1 from './data/configuration_1.json';

import craftai, { errors } from '../src';
// import INVALID_CONFIGURATION_1 from './data/invalid_configuration_1.json';

describe('BULK: client.createAgents([{id, <configuration>}, {<configuration>}, ...])', function() {
  let client;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });

  it('should succeed when using valid configurations and generated ids', function() {
    return client
      .createAgents([
        { configuration: CONFIGURATION_1 },
        { configuration: CONFIGURATION_1 }
      ])
      .then((res_list) => {
        res_list.map((agent) => {
          expect(agent).to.be.ok;
          expect(agent.id).to.be.a.string;
          return client.getAgent(agent.id).then((retrieveAgent) => {
            expect(retrieveAgent.configuration).to.be.deep.equal(
              CONFIGURATION_1
            );
            return client.deleteAgent(agent.id);
          });
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
        console.log(res_list);
        res_list.map((agent) => {
          expect(agent).to.be.ok;
          expect(agent.id).to.be.a.string;
          return client.getAgent(agent.id).then((retrieveAgent) => {
            expect(retrieveAgent.configuration).to.be.deep.equal(
              CONFIGURATION_1
            );
            return client.deleteAgent(agent.id);
          });
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
          expect(agent).to.be.ok;
          expect(agent.id).to.be.a.string;
          return client.getAgent(agent.id).then((retrieveAgent) => {
            expect(retrieveAgent.configuration).to.be.deep.equal(
              CONFIGURATION_1
            );
            return client.deleteAgent(agent.id);
          });
        });
      });
  });

  // test with wrong id

  function testAgentIntegrity(agent, agentId, configuration) {
    expect(agent).to.be.ok;
    expect(agent.id).to.be.equal(agentId);
    expect(agent.status).to.not.be.equal(400);
    return client.getAgent(agent.id).then((retrieveAgent) => {
      expect(retrieveAgent.configuration).to.be.deep.equal(configuration);
    });
  }

  // ATTENTION A BIEN UTILISER LA FUNCTION TEST AGENT INTEGRITY

  it.only('should \'succeed\' when using the same id twice', function() {
    const agentId = 'donald_truck';
    return client
      .createAgents([{ id: agentId, configuration: CONFIGURATION_1 }])
      .then((agentsList0) => {
        agentsList0.map((agent) => {
          return testAgentIntegrity(agent, agentId, CONFIGURATION_1);
        });
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

  // it('should \'succeed\' when having mixed results', function() {
  //   return client
  //     .createAgents([{ id: agentId, configuration: CONFIGURATION_1 }])
  //     .then((agentsList0) => {});
  // });
});
