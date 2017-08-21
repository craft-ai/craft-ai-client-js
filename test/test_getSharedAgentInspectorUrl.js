import CONFIGURATION_1 from './data/configuration_1.json';

import craftai from '../src';

describe('client.sharedAgentInspectorUrl(<agentId>, <timestamp>)', function() {
  let client;
  const agentId = `get_public_url_${RUN_ID}`;

  before(function() {
    client = craftai(CRAFT_CFG);
    expect(client).to.be.ok;
    return client.deleteAgent(agentId)
      .then(() => client.createAgent(CONFIGURATION_1, agentId));
  });

  after(function() {
    client.deleteAgent(agentId);
  });

  it('should return a shared inspector url', function() {
    const timestamp = 1234567890987;
    return client.getSharedAgentInspectorUrl(agentId, timestamp)
      .then((publicInspectorUrl) => {
        expect(publicInspectorUrl).to.not.be.equal('');
        const splittedPublicInspectorUrl = publicInspectorUrl.split('?');
        expect(splittedPublicInspectorUrl.length).to.be.equal(2);
        expect(splittedPublicInspectorUrl[1]).to.be.equal(`t=${timestamp}`);
        return client.getAgentInspectorUrl(agentId, timestamp)
          .then((publicInspectorUrlDeprecated) => {
            expect(publicInspectorUrlDeprecated, publicInspectorUrl);
          });
      });
  });

  it('should return a new shared inspector url, after the deletion of the previous one', function() {
    return client.getSharedAgentInspectorUrl(agentId)
      .then((publicInspectorUrl) => {
        expect(publicInspectorUrl).to.not.be.equal('');
        const splittedPublicInspectorUrl = publicInspectorUrl.split('?');
        expect(splittedPublicInspectorUrl.length).to.be.equal(1);
        return client.deleteSharedAgentInspectorUrl(agentId)
          .then(() => client.getSharedAgentInspectorUrl(agentId))
          .then((publicInspectorUrl2) => {
            expect(publicInspectorUrl2).to.not.be.equal(publicInspectorUrl);
          });
      });
  });

  it('should return a shared inspector url, when no timestamp is specified', function() {
    const timestamp = 1234567890987;
    return client.getSharedAgentInspectorUrl(agentId)
      .then((publicInspectorUrl) => {
        expect(publicInspectorUrl).to.not.be.equal('');
        const splittedPublicInspectorUrl = publicInspectorUrl.split('?');
        expect(splittedPublicInspectorUrl.length).to.be.equal(1);
        return client.getAgentInspectorUrl(agentId)
          .then((publicInspectorUrlDeprecated) => {
            expect(publicInspectorUrlDeprecated, publicInspectorUrl);
            return client.getSharedAgentInspectorUrl(agentId, timestamp);
          })
          .then((publicInspectorUrl2) => {
            expect(publicInspectorUrl).to.not.be.equal(publicInspectorUrl2);
            expect(publicInspectorUrl, publicInspectorUrl2.split('?')[0]);
          });
      });
  });

  it('should raise an error when timestamp is invalid', function() {
    return client.getSharedAgentInspectorUrl(agentId, 'toto')
      .then(
        () => Promise.reject(new Error('Should not be reached')),
        (err) => {
          expect(err.name).to.be.equal('CraftAiTimeError');
          expect(err.message).to.be.equal('Time error, given "toto" is invalid.');
        }
      );
  });
});
