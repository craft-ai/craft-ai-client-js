import CONFIGURATION_1 from "./data/configuration_1.json";

import craftai, { errors } from "../src";
import INVALID_CONFIGURATION_1 from "./data/invalid_configuration_1.json";

describe("client.createAgents([{id, <configuration>}, {<configuration>}, ...])", function() {
  let client;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
  });

  it.only("should succeed when using valid configurations and generated ids", function() {
    return client
      .createAgents([
        { configuration: CONFIGURATION_1 },
        { configuration: CONFIGURATION_1 }
      ])
      .then(res_list => {
        res_list.map(agent => {
          expect(agent).to.be.ok;
          expect(agent.id).to.be.a.string;
          return client.getAgent(agent.id).then(retrieveAgent => {
            expect(retrieveAgent.configuration).to.be.deep.equal(
              CONFIGURATION_1
            );
            return client.deleteAgent(agent.id);
          });
        });
      });
  });
});
