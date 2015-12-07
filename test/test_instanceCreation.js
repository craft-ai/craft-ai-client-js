import _ from 'lodash';
import assert from 'assert';
import craftai, { STATUS } from '../src';
import dotenv from 'dotenv';

dotenv.config({silent: true});
dotenv.load();

const CRAFT_CFG = {
  owner: 'craft-ai',
  name: 'craft-ai-client-js',
  version: 'master',
  appId: process.env.CRAFT_APP_ID,
  appSecret: process.env.CRAFT_APP_SECRET
}

describe('craftai', function() {
  describe('(<config>)', function() {
    it('should create an instance with valid APP_ID/APP_SECRET', function() {
      this.timeout(5000);
      return craftai(CRAFT_CFG)
        .then(instance => {
          assert.notEqual(instance.id , undefined);
          assert.equal(instance.getStatus() , STATUS.running);
          assert.equal(instance.cfg.owner , CRAFT_CFG.owner);
          assert.equal(instance.cfg.name , CRAFT_CFG.name);
          assert.equal(instance.cfg.version , CRAFT_CFG.version);
          assert.equal(instance.cfg.appId , CRAFT_CFG.appId);
          assert.equal(instance.cfg.appSecret , CRAFT_CFG.appSecret);
          return instance.destroy()
            .then(() => {
              assert.equal(instance.getStatus() , STATUS.destroyed);
            });
        })
        .catch(err => {
          assert.fail(err, undefined);
        });
    });
    it('should fail with invalid APP_ID/APP_SECRET', function() {
      return craftai(_.extend(CRAFT_CFG, {
          appId: 'baaaah',
          appSecret: 'booooh'
        }))
        .catch(err => {
          assert.notEqual(err , undefined);
        });
    });
    it('should fail with missing project owner', function() {
      return craftai(_.extend(CRAFT_CFG, {
          owner: undefined
        }))
        .catch(err => {
          assert.notEqual(err , undefined);
        });
    });
    it('should fail with missing project name', function() {
      return craftai(_.extend(CRAFT_CFG, {
          name: undefined
        }))
        .catch(err => {
          assert.notEqual(err , undefined);
        });
    });
    it('should fail with missing project version', function() {
      return craftai(_.extend(CRAFT_CFG, {
          version: undefined
        }))
        .catch(err => {
          assert.notEqual(err , undefined);
        });
    });
  });
});
