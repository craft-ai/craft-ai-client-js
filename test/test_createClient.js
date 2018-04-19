import craftai, { errors } from '../src';

describe('craftai(<token_or_cfg>)', function() {
  it('should create a valid client given a valid configuration', function() {
    const client = craftai(CRAFT_CFG);
    expect(client.cfg.url).to.be.ok;
    expect(client.cfg.owner).to.be.ok;
    expect(client.cfg.project).to.be.ok;
    expect(client.cfg.token).to.be.equal(CRAFT_CFG.token);
  });

  it('should create a valid client given a valid token', function() {
    const client = craftai(CRAFT_CFG.token);
    expect(client.cfg.url).to.be.ok;
    expect(client.cfg.owner).to.be.ok;
    expect(client.cfg.project).to.be.ok;
    expect(client.cfg.token).to.be.equal(CRAFT_CFG.token);
  });

  it('should fail properly given an invalid token', function() {
    expect(() => craftai('this is an invalid token')).to.throw(errors.CraftAiCredentialsError);
  });
});
