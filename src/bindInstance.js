import _ from 'lodash';
import * as errors from './errors';
import Debug from 'debug';
import DEFAULTS from './defaults';
import instance from './instance';
import request from './request';
import STATUS from './status';

let debug = Debug('craft-ai:client');

export default function bindInstance(cfg, knowledge = undefined) {
  cfg = _.defaults(_.clone(cfg), {
    destroyOnExit: false
  }, DEFAULTS);
  if (!_.has(cfg, 'owner') || !_.isString(cfg.owner)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to bind an instance with no or invalid project owner provided.'));
  }
  if (!_.has(cfg, 'name') || !_.isString(cfg.name)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to bind an instance with no or invalid project name provided.'));
  }
  if (!_.has(cfg, 'version') || !_.isString(cfg.version)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to bind an instance with no or invalid project version provided.'));
  }
  if (!_.has(cfg, 'id') || !_.isString(cfg.id)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to bind an instance with no or invalid identifier provided.'));
  }
  if (cfg.destroyOnExit) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to destroy on exist a bound instance (only the instance creator can do that).'));
  }

  return request({
    path: '/' + cfg.id
  }, cfg)
    .then(json => {
      debug(`Instance '${cfg.id}' from ${cfg.owner}/${cfg.name}/${cfg.version} bound`);
      return instance(cfg, STATUS.running);
    });
}
