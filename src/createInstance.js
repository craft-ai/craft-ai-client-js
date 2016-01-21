import _ from 'lodash';
import * as errors from './errors';
import Debug from 'debug';
import DEFAULTS from './defaults';
import instance from './instance';
import request from './request';
import STATUS from './status';

let debug = Debug('craft-ai:client');

export default function createInstance(cfg, knowledge = undefined) {
  cfg = _.defaults(_.clone(cfg), DEFAULTS);
  if (!_.has(cfg, 'owner') || !_.isString(cfg.owner)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to create an instance with no or invalid project owner provided.'));
  }
  if (!_.has(cfg, 'name') || !_.isString(cfg.name)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to create an instance with no or invalid project name provided.'));
  }
  if (!_.has(cfg, 'version') || !_.isString(cfg.version)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to create an instance with no or invalid project version provided.'));
  }

  return request({
    method: 'PUT',
    body: {
      knowledge: knowledge
    }
  }, cfg)
  .then(json => {
    const instanceId = json.instance.instance_id;

    debug(`Instance '${instanceId}' created from ${cfg.owner}/${cfg.name}/${cfg.version}`);

    return instance(_.extend(cfg, {
      id: instanceId
    }), STATUS.running);
  });
}
