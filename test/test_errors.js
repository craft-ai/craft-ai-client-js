import { errors } from '../src';

describe('errors', function() {
  describe('.CraftAiError', function() {
    const e = new errors.CraftAiError('test');
    it('specializes Error', function() {
      expect(e).to.be.an.instanceof(Error);
    });
    it('has a "message" property', function() {
      expect(e).to.have.property('message', 'test');
    });
  });
  describe('.CraftAiUnknownError', function() {
    const e = new errors.CraftAiUnknownError();
    it('specializes Error', function() {
      expect(e).to.be.an.instanceof(Error);
    });
    it('specializes errors.CraftAiError', function() {
      expect(e).to.be.an.instanceof(errors.CraftAiError);
    });
    it('has a default "message" property', function() {
      expect(e).to.have.property('message', 'Unknown error occured');
    });
  });
  describe('.CraftAiNetworkError', function() {
    const e = new errors.CraftAiNetworkError();
    it('specializes Error', function() {
      expect(e).to.be.an.instanceof(Error);
    });
    it('specializes errors.CraftAiError', function() {
      expect(e).to.be.an.instanceof(errors.CraftAiError);
    });
    it('has a default "message" property', function() {
      expect(e).to.have.property('message', 'Network issue, see err.more for details');
    });
  });
  describe('.CraftAiCredentialsError', function() {
    const e = new errors.CraftAiCredentialsError();
    it('specializes Error', function() {
      expect(e).to.be.an.instanceof(Error);
    });
    it('specializes errors.CraftAiError', function() {
      expect(e).to.be.an.instanceof(errors.CraftAiError);
    });
    it('has a default "message" property', function() {
      expect(e).to.have.property('message', 'Credentials error, make sure the given token is valid');
    });
  });
  describe('.CraftAiInternalError', function() {
    const e = new errors.CraftAiInternalError();
    it('specializes Error', function() {
      expect(e).to.be.an.instanceof(Error);
    });
    it('specializes errors.CraftAiError', function() {
      expect(e).to.be.an.instanceof(errors.CraftAiError);
    });
    it('has a default "message" property', function() {
      expect(e).to.have.property('message', 'Internal Error, see err.more for details');
    });
  });
  describe('.CraftAiBadRequestError', function() {
    const e = new errors.CraftAiBadRequestError();
    it('specializes Error', function() {
      expect(e).to.be.an.instanceof(Error);
    });
    it('specializes errors.CraftAiError', function() {
      expect(e).to.be.an.instanceof(errors.CraftAiError);
    });
    it('has a default "message" property', function() {
      expect(e).to.have.property('message', 'Bad Request, see err.more for details');
    });
  });
  describe('.CraftAiLongRequestTimeOutError', function() {
    const e = new errors.CraftAiLongRequestTimeOutError();
    it('specializes Error', function() {
      expect(e).to.be.an.instanceof(Error);
    });
    it('specializes errors.CraftAiError', function() {
      expect(e).to.be.an.instanceof(errors.CraftAiError);
    });
    it('has a default "message" property', function() {
      expect(e).to.have.property('message', 'Request timed out because the computation is not finished, please try again');
    });
  });
});
