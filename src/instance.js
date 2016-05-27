import _ from 'lodash';
import { IN_BROWSER } from './constants';
import { Router } from 'express';
import * as errors from './errors';
import bodyParser from 'body-parser';
import Debug from 'debug';
import DEFAULTS from './defaults';
import onExit from './onExit';
import request from './request';
import STATUS from './status';
import WebSocket from './ws';

const START_SUFFIX = '#s';
const CANCEL_SUFFIX = '#c'; // START_SUFFIX.length === CANCEL_SUFFIX.length

let debug = Debug('craft-ai:client');

export default function instance(cfg, status) {
  // Initialization check
  if (!_.has(cfg, 'owner') || !_.isString(cfg.owner)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to initialize an instance with no or invalid project owner provided.'));
  }
  if (!_.has(cfg, 'name') || !_.isString(cfg.name)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to initialize an instance with no or invalid project name provided.'));
  }
  if (!_.has(cfg, 'version') || !_.isString(cfg.version)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to initialize an instance with no or invalid project version provided.'));
  }
  if (!_.has(cfg, 'id') || !_.isString(cfg.id)) {
    return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to initialize an instance with no or invalid instance identifier provided.'));
  }

  // Private attributes
  let actions = {};
  let ws;
  let onDestroy = () => undefined;

  // Private methods
  let actionSuccess = (instance, requestId, output) => request({
    method: 'POST',
    path: '/' + instance.id + '/actions/' + requestId + '/success',
    body: output
  }, instance);
  let actionFailure = (instance, requestId, output) => request({
    method: 'POST',
    path: '/' + instance.id + '/actions/' + requestId + '/failure',
    body: output
  }, instance);
  let actionCancelation = (instance, requestId) => request({
    method: 'POST',
    path: '/' + instance.id + '/actions/' + requestId + '/cancelation'
  }, instance);
  let initWs = (instance) => {
    ws = new WebSocket(instance.wsApiUrl + '/' + instance.owner + '/' + instance.name + '/' + instance.version + '/' + instance.id + '/websockets');
    ws.onmessage = function(evt) {
      if (evt.data != 'ping') {
        const data = JSON.parse(evt.data);
        const actionName = data.call.substring(0, data.call.length - START_SUFFIX.length);
        if (_.endsWith(data.call, CANCEL_SUFFIX)) {
          actions[actionName].cancel(
            data.requestId,
            data.agentId,
            () => actionCancelation(instance, data.requestId)
          );
        }
        else if (_.endsWith(data.call, START_SUFFIX)) {
          actions[actionName].start(
            data.requestId,
            data.agentId,
            data.input,
            output => actionSuccess(instance, data.requestId, output),
            output => actionFailure(instance, data.requestId, output)
          );
        }
      }
      ws.send('Done');
    };
    ws.onopen = function() {
      debug(`Instance '${instance.id}' websocket opened.`);
      ws.send('socket open');
    };
    ws.onclose = function() {
      debug(`Instance '${instance.id}' websocket closed.`);
      initWs(instance);
    };
    ws.onerror = function() {
      debug(`Instance '${instance.id}' websocket errored.`);
      initWs(instance);
    };
  };

  // 'Public' attributes & methods
  let instance = _.defaults(_.clone(cfg), DEFAULTS, {
    cfg: cfg,
    status: status,
    getStatus: function() {
      return this.status;
    },
    getGoogleAuthUri: function(successUri, failureUri) {
      return this.httpApiUrl + '/auth/google?x-craft-ai-app-id=' +
        this.appId + '&x-craft-ai-app-secret=' + this.appSecret + '&success_uri=' +
        this.successUri + '&failure_uri=' + this.failureUri + '?failure=true';
    },
    destroy: function() {
      this.status = STATUS.stopping;
      let params = 'cleanup=' + this.cfg.cleanupOnDestroy;
      return request({
        method: 'DELETE',
        path: '/'+ this.id + '?' + params
      }, this)
      .then(() => {
        debug(`Instance '${this.id}' destroyed`);
        onDestroy();
        this.status = STATUS.destroyed;
      })
      .catch(err => {
        this.status = STATUS.destroyed;
        return Promise.reject(err);
      });
    },
    destroySync: function() {
      this.status = STATUS.stopping;
      let params = 'cleanup=' + this.cfg.cleanupOnDestroy;
      request({
        method: 'DELETE',
        path: '/'+ this.id + '?' + params,
        asynchronous: false
      }, this);
      debug(`Instance '${this.id}' destroyed`);
      onDestroy();
      this.status = STATUS.destroyed;
    },
    registerAction: function(name, start, cancel = () => undefined) {
      debug('Using deprecated `instance.registerAction`, please use `instance.registerWebsocketAction`.');
      return this.registerWebsocketAction(name, start, cancel);
    },
    registerWebsocketAction: function(name, start, cancel = () => undefined) {
      if (_.isUndefined(ws)) {
        initWs(this);
      }
      return request({
        method: 'PUT',
        path: '/' + this.id + '/actions',
        body: {
          name: name,
          start: name + START_SUFFIX,
          cancel: name + CANCEL_SUFFIX
        }
      }, this)
      .then(() => {
        actions[name] = {
          start: start,
          cancel: cancel
        };
      });
    },
    registerWebhookAction: IN_BROWSER ? undefined : function(rootUrl, name, start, cancel = () => undefined) {
      return request({
        method: 'PUT',
        path: '/' + this.id + '/actions',
        body: {
          name: name,
          url: rootUrl + '/' + name + '/'
        }
      }, this)
      .then(() => {
        let router = Router();
        router.post(`/${this.id}/${name}/start`, bodyParser.json(), (req, res) => {
          const p = _.defaults(req.body, {
            input: {},
            requestId: null,
            agentId: null
          });
          const msg = `Starting '${name}' request #${p.requestId} on agent #${p.agentId}`;
          start(
            p.requestId,
            p.agentId,
            p.input,
            output => actionSuccess(this, p.requestId, output),
            output => actionFailure(this, p.requestId, output)
          );
          res.send({
            message: msg
          });
        });

        router.post(`/${this.id}/${name}/cancel`, bodyParser.json(), (req, res) => {
          const p = _.defaults(req.body, {
            requestId: null
          });
          const msg = `Cancelling '${name}' request #${p.requestId}`;
          cancel(
            p.requestId,
            p.agentId,
            () => actionCancelation(this, p.requestId)
          );
          res.send({
            message: msg
          });
        });

        return router;
      });
    },
    createAgent: function(behavior, knowledge = {}) {
      if (_.isUndefined(behavior)) {
        return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to create an agent with no behavior provided.'));
      }

      return request({
        method: 'PUT',
        path: '/' + this.id + '/agents',
        body: {
          behavior: behavior,
          knowledge: knowledge
        }
      }, this)
      .then((json) => {
        debug(`Agent #${json.agent.id} created using behavior ${behavior}`);
        return json.agent;
      });
    },
    getAgentKnowledge: function(agentId) {
      if (_.isUndefined(agentId)) {
        return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to retrieve agent knowledge with no agentId provided.'));
      }

      return request({
        method: 'GET',
        path: '/' + this.id + '/agents/' + agentId + '/knowledge'
      }, this)
      .then(json => json.knowledge);
    },
    updateAgentKnowledge: function(agentId, knowledge={}, method='set') {
      if (_.isUndefined(agentId)) {
        return Promise.reject(new errors.CraftAiBadRequestError('Bad Request, unable to update agent knowledge with no agentId provided.'));
      }

      return request({
        method: 'POST',
        path: '/' + this.id + '/agents/' + agentId + '/knowledge?method=' + method,
        body: knowledge
      }, this);
    },
    getInstanceKnowledge: function() {
      return request({
        method: 'GET',
        path: '/' + this.id + '/instanceKnowledge'
      }, this)
      .then(json => json.knowledge);
    },
    updateInstanceKnowledge: function(knowledge={}, method='set') {
      return request({
        method: 'POST',
        path: '/' + this.id + '/instanceKnowledge?method=' + method,
        body: knowledge
      }, this)
      .then((json)=>{
        return json;
      });
    },
    update: function(delay = undefined) {
      let singleUpdate = () => {
        return request({
          method: 'POST',
          path: '/' + this.id + '/update',
          body: {
            ts: new Date().getTime()
          }
        }, this);
      };

      if (this.status !== STATUS.running) {
        return Promise.reject(new errors.CraftAiError('Can\'t update the instance, it is not running.'));
      }
      else if (_.isUndefined(delay)) {
        return singleUpdate();
      }
      else {
        return singleUpdate()
          .then(() => new Promise(resolve => setTimeout(resolve, delay)))
          .then(() => this.update(delay));
      }
    }
  });

  if (instance.destroyOnExit) {
    onDestroy = onExit(() => {
      debug(`Destroying instance '${instance.id}' before exiting...`);
      instance.destroySync();
    });
  }

  return instance;
}
