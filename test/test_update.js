import craftai, { errors, STATUS } from '../src';

describe('instance.update()', function() {
  this.timeout(5000);
  let instance;
  let agentId;
  const initialAgentKnowledge = {
    foo: "bar",
    baz: 3
  }
  beforeEach(function() {
    return craftai(CRAFT_CFG)
      .then(newInstance => {
        expect(newInstance.id).to.be.ok;
        instance = newInstance;
        return instance.createAgent('test/bts/test.bt', initialAgentKnowledge);
      })
      .then(agent => {
        expect(agent).to.be.ok;
        expect(agent.id).to.be.at.least(0);
        agentId = agent.id;
      })
  });
  afterEach(function() {
    if (instance) {
      return instance.destroy()
        .then(() => {
          expect(instance.getStatus()).to.equal(STATUS.destroyed);
          instance = undefined;
          agentId = undefined;
        })
    }
  });
  it('should call "Test" action start callback', function() {
    let testStartCbCallCount = 0;
    const expectedActionInput = {
      p1: "bar"
    }
    let testStartCb = (r, a, i, sCb, fCb) => {
      expect(r).to.be.at.least(0);
      expect(a).to.be.equal(agentId);
      expect(i).to.be.deep.equal(expectedActionInput);
      expect(sCb).to.be.a('function');
      expect(fCb).to.be.a('function');

      testStartCbCallCount = testStartCbCallCount + 1;

      // Calling success
      sCb();
    }
    return instance.registerAction('Test', testStartCb)
      .then(() => {
        expect(testStartCbCallCount).to.be.equal(0);
      })
      .then(() => instance.update())
      .then(() => new Promise((resolve, reject) => setTimeout(() => resolve(), 1000)))
      .then(() => {
        expect(testStartCbCallCount).to.be.equal(1);
      })
  });
  it('should fail if the used action, "Test", is not registered', function() {
    return instance.update()
      .catch(err => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiInternalError); // This shouldn't be an internal error.
      });
  });
});
