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

  it('should fail properly given an invalid proxy', function() {
    expect(
      () => craftai(Object.assign({}, CRAFT_CFG, {
        proxy: 7
      }))
    ).to.throw(errors.CraftAiBadRequestError);

    expect(
      () => craftai(Object.assign({}, CRAFT_CFG, {
        proxy: 'tutututu'
      }))
    ).to.throw(errors.CraftAiBadRequestError);
  });

  it('should create a valid client given a valid proxy configuration', function() {
    const proxy = 'http://10.180.0.146:3128/';

    const client = craftai(Object.assign({}, CRAFT_CFG, { proxy }));

    expect(client.cfg.url).to.be.ok;
    expect(client.cfg.owner).to.be.ok;
    expect(client.cfg.project).to.be.ok;
    expect(client.cfg.proxy).to.be.equal(proxy);
  });
});
