import craftai, { errors, STATUS } from '../src';
import express from 'express';
import fetch from 'isomorphic-fetch';

describe('instance.registerWebhookAction()', function() {
  this.timeout(5000);
  let instance;
  let agentId;
  beforeEach(function() {
    return craftai(CRAFT_CFG)
      .then(newInstance => {
        expect(newInstance.id).to.be.ok;
        instance = newInstance;
        return instance.createAgent('test/bts/test.bt')
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
  it('should create a router for a "Test" action', function() {
    const TEST_PORT = 8080;
    const TEST_REQUEST_ID = 13;
    const TEST_AGENT_ID = 456;
    const TEST_INPUT = {
      i1: 45,
      i3: false
    };
    let testStartCbCallCount = 0;
    let testCancelCbCallCount = 0;
    let testStartCb = (r, a, i, sCb, fCb) => {
      expect(r).to.be.equal(TEST_REQUEST_ID);
      expect(a).to.be.equal(TEST_AGENT_ID);
      expect(i).to.be.deep.equal(TEST_INPUT);
      expect(sCb).to.be.a('function');
      expect(fCb).to.be.a('function');

      testStartCbCallCount = testStartCbCallCount + 1;
    }

    let testCancelCb = (r, a, cCb) => {
      expect(r).to.be.equal(TEST_REQUEST_ID);
      expect(a).to.be.equal(TEST_AGENT_ID);
      expect(cCb).to.be.a('function');

      testCancelCbCallCount = testCancelCbCallCount + 1;
    }

    let app = express();
    app.listen(TEST_PORT);
    return instance.registerWebhookAction(`http://localhost:${TEST_PORT}`, 'Test', testStartCb)
      .then(router => {
        // Use the action router
        app.use(router);

        expect(testStartCbCallCount).to.be.equal(0);
        expect(testCancelCbCallCount).to.be.equal(0);
      })
      .then(() => fetch(`http://localhost:${TEST_PORT}/Test/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          requestId: TEST_REQUEST_ID,
          agentId: TEST_AGENT_ID,
          input: TEST_INPUT
        })
      }))
      .then(() => new Promise((resolve, reject) => setTimeout(() => resolve(), 1000)))
      .then(() => {
        expect(testStartCbCallCount).to.be.equal(1);
        expect(testCancelCbCallCount).to.be.equal(0);
      })
      .then(() => fetch(`http://localhost:${TEST_PORT}/Test/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          requestId: TEST_REQUEST_ID,
          agentId: TEST_AGENT_ID
        })
      }))
      .then(() => new Promise((resolve, reject) => setTimeout(() => resolve(), 1000)))
      .then(() => {
        expect(testStartCbCallCount).to.be.equal(1);
        expect(testCancelCbCallCount).to.be.equal(0);
      });
  });
});
