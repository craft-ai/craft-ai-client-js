import _ from 'lodash';
import { expect } from 'chai';
import Debug from 'debug';

window.logger = Debug;

if (!_.isUndefined(__DEBUG__)) {
  window.logger.enable(__DEBUG__);
}

const CRAFT_CFG = {
  owner: __CRAFT_OWNER__,
  token: __CRAFT_TOKEN__,
  url: __CRAFT_URL__
};

window._ = _;
window.CRAFT_CFG = CRAFT_CFG;
window.debug = Debug('craft-ai:client:test');
window.expect = expect;
window.IN_BROWSER = true;
global.RUN_ID = __TRAVIS_BUILD_ID__ || 'local';
