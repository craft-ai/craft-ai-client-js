import craftai, { bindInstance, errors, STATUS } from '../src';

describe('bindInstance(<config>)', function() {
  this.timeout(5000);
  let instance;
  before(function() {
    return craftai(CRAFT_CFG)
      .then(newInstance => {
        expect(newInstance.id).to.be.ok;
        instance = newInstance;
      })
  });
  after(function() {
    if (instance) {
      return instance.destroy()
        .then(() => {
          expect(instance.getStatus()).to.equal(STATUS.destroyed);
          instance = undefined;
        })
    }
  });
  it('should be able to bind the just created instance', function() {
    return bindInstance(_.extend(_.clone(CRAFT_CFG), {
      id: instance.id
      }))
      .then(boundInstance => {
        expect(boundInstance).to.be.ok;
        expect(boundInstance.id).to.be.equal(instance.id);
      });
  });
  it('should fail to bind an instance when no identifier is provided', function() {
    return bindInstance(CRAFT_CFG)
      .catch(err => {
        expect(err).to.be.an.instanceof(errors.CraftAiError);
        expect(err).to.be.an.instanceof(errors.CraftAiBadRequestError);
      });
  });
  // it('should fail to bind an instance when a bad identifier is provided', function() {
  //   this.timeout(90000); // This should not be necessary.
  //   return bindInstance(_.extend(_.clone(CRAFT_CFG), {
  //     id: 'kiki_koko'
  //     }))
  //     .catch(err => {
  //       expect(err).to.be.an.instanceof(errors.CraftAiError);
  //       expect(err).to.be.an.instanceof(errors.CraftAiNetworkError); // This should not be that.
  //     });
  // });
  it('should be able to create a valid agent on a bound instance', function() {
    return bindInstance(_.extend(_.clone(CRAFT_CFG), {
      id: instance.id
      }))
      .then(boundInstance => {
        return instance.createAgent('test/bts/test.bt')
      })
      .then(agent => {
        expect(agent).to.be.ok;
        expect(agent.id).to.be.at.least(0);
      });
  });
});
