import _ from 'lodash';
import createRequest from './request';
import Debug from 'debug';
import { decide } from './interpreter';
import DEFAULTS from './defaults';
import jwtDecode from 'jwt-decode';
import Time from './time';
import {
  AGENT_ID_ALLOWED_REGEXP,
  AGENT_ID_MAX_LENGTH,
  DEFAULT_DECISION_TREE_VERSION,
  deprecation
} from './constants';
import {
  CraftAiBadRequestError,
  CraftAiCredentialsError,
  CraftAiLongRequestTimeOutError
} from './errors';

let debug = Debug('craft-ai:client');

function resolveAfterTimeout(timeout) {
  return new Promise((resolve) => setTimeout(() => resolve(), timeout));
}

// A very simple regex, helps detect some issues.
const SIMPLE_HTTP_URL_REGEX = /^https?:\/\/.*$/;

function isUrl(url) {
  return SIMPLE_HTTP_URL_REGEX.test(url);
}

const isUnvalidId = (id) => !_.isUndefined(id) && !AGENT_ID_ALLOWED_REGEXP.test(id);
const isUnvalidConfiguration = (configuration) => _.isUndefined(configuration) || !_.isObject(configuration);
const areUnvalidOperations = (operations) => _.isUndefined(operations) || !_.isArray(operations);

function testId(id) {
  if (isUnvalidId(id)) {
    throw new CraftAiBadRequestError(`Bad Request, unable to handle agent ${id} because it is an invalid agent id. It must only contain characters in "a-zA-Z0-9_-" and must be a string between 1 and ${AGENT_ID_MAX_LENGTH} characters.`);
  }
}

function testConfiguration(configuration, id=undefined) {
  if (isUnvalidConfiguration(configuration)) {
    throw new CraftAiBadRequestError(`Bad Request, unable to create an agent with no or invalid configuration provided for agent ${id}.`);
  }
}

function testOperations(operations, id=undefined) {
  if (areUnvalidOperations(operations)) {
    throw new CraftAiBadRequestError(`Bad Request, unable to handle operations for agent ${id}. Operations should be provided within an array.`);
  }
}

function testBulkInput(bulkArray) {
  if (_.isUndefined(bulkArray)) {
      throw new CraftAiBadRequestError('Bad Request, unable to use bulk functionalities without list provided.');
  }
  if (!_.isArray(bulkArray)) {
      throw new CraftAiBadRequestError('Bad Request, bulk inputs should be provided within an array.');
  }
  if (!bulkArray.length) {
      throw new CraftAiBadRequestError('Bad Request, the array containing bulk inputs is empty.');
  }
};

export default function createClient(tokenOrCfg) {
  let cfg = _.defaults(
    {},
    _.isString(tokenOrCfg) ? { token: tokenOrCfg } : tokenOrCfg,
    DEFAULTS
  );

  // Initialization check
  if (!_.has(cfg, 'token') || !_.isString(cfg.token)) {
    throw new CraftAiBadRequestError('Bad Request, unable to create a client with no or invalid token provided.');
  }
  try {
    const { owner, platform, project } = jwtDecode(cfg.token);

    // Keep the provided values
    cfg.owner = cfg.owner || owner;
    cfg.project = cfg.project || project;
    cfg.url = cfg.url || platform;
  }
  catch (e) {
    throw new CraftAiCredentialsError();
  }
  if (!_.has(cfg, 'url') || !isUrl(cfg.url)) {
    throw new CraftAiBadRequestError('Bad Request, unable to create a client with no or invalid url provided.');
  }
  if (!_.has(cfg, 'project') || !_.isString(cfg.project)) {
    throw new CraftAiBadRequestError('Bad Request, unable to create a client with no or invalid project provided.');
  }
  else {
    const splittedProject = cfg.project.split('/');
    if (splittedProject.length >= 2) {
      cfg.owner = splittedProject[0];
      cfg.project = splittedProject[1];
    }
  }
  if (!_.has(cfg, 'owner') || !_.isString(cfg.owner)) {
    throw new CraftAiBadRequestError('Bad Request, unable to create a client with no or invalid owner provided.');
  }
  if (cfg.proxy != null && !isUrl(cfg.proxy)) {
    throw new CraftAiBadRequestError('Bad Request, unable to create a client with an invalid proxy url provided.');
  }

  debug(`Creating a client instance for project '${cfg.owner}/${cfg.project}' on '${cfg.url}'.`);

  const request = createRequest(cfg);

  // 'Public' attributes & methods
  let instance = {
    cfg: cfg,
    createAgent: function(configuration, id = undefined) {
      if (isUnvalidConfiguration(configuration)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to create an agent with no or invalid configuration provided.'));
      }

      if (isUnvalidId(id)) {
        return Promise.reject(new CraftAiBadRequestError(`Bad Request, unable to create an agent with invalid agent id. It must only contain characters in "a-zA-Z0-9_-" and must be a string between 1 and ${AGENT_ID_MAX_LENGTH} characters.`));
      }

      return request({
        method: 'POST',
        path: '/agents',
        body: {
          id: id,
          configuration: configuration
        }
      })
        .then(({ body }) => {
          debug(`Agent '${body.id}' created.`);
          return body;
        });
    },
    createAgents: function(agentsList) {
      testBulkInput(agentsList);
      agentsList.map(({ id, configuration }) => {
        testId(id);
        testConfiguration(configuration);
      });

      return request({
        method: 'POST',
        path: '/bulk/agents',
        body: agentsList
      })
        .then(({ body }) => body);
    },
    getAgent: function(agentId) {
      if (!AGENT_ID_ALLOWED_REGEXP.test(agentId)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to get an agent with invalid agent id. It must only contain characters in "a-zA-Z0-9_-" and cannot be the empty string.'));
      }

      return request({
        method: 'GET',
        path: `/agents/${agentId}`
      })
        .then(({ body }) => body);
    },
    listAgents: function(agentId) {
      return request({
        method: 'GET',
        path: '/agents'
      })
        .then(({ body }) => body.agentsList);
    },
    deleteAgent: function(agentId) {
      if (_.isUndefined(agentId)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to delete an agent with no agentId provided.'));
      }

      return request({
        method: 'DELETE',
        path: `/agents/${agentId}`
      })
        .then(({ body }) => {
          debug(`Agent '${agentId}' deleted`);
          return body;
        });
    },
    deleteAgents: function(agentsList) {
      testBulkInput(agentsList);
      agentsList.map(({ id }) => testId(id));

      return request({
        method: 'DELETE',
        path: '/bulk/agents',
        body: agentsList
      })
        .then(({ body }) => body);
    },
    destroyAgent: function(agentId) {
      deprecation('client.destroyAgent', 'client.deleteAgent');
      return this.deleteAgent(agentId);
    },
    getAgentContext: function(agentId, t = undefined) {
      if (_.isUndefined(agentId)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to get the agent context with no agentId provided.'));
      }
      let posixTimestamp = Time(t).timestamp;
      if (_.isUndefined(posixTimestamp)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to get the agent context with an invalid timestamp provided.'));
      }

      return request({
        method: 'GET',
        path: `/agents/${agentId}/context/state`,
        query: {
          t: posixTimestamp
        }
      })
        .then(({ body }) => body);
    },
    addAgentContextOperations: function(agentId, operations) {
      if (_.isUndefined(agentId)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to add agent context operations with no agentId provided.'));
      }
      if (!_.isArray(operations)) {
        // Only one given operation
        operations = [operations];
      }
      operations = _.compact(operations);

      if (!operations.length) {
        const message = `No operation to add to the agent ${cfg.owner}/${cfg.project}/${agentId} context.`;

        debug(message);

        return Promise.resolve({ message });
      }

      return _(operations)
        .map(({ context, timestamp }) => ({
          context: context,
          timestamp: Time(timestamp).timestamp
        }))
        .orderBy('timestamp')
        .chunk(cfg.operationsChunksSize)
        .reduce((p, chunk) => p.then(
          () => request({
            method: 'POST',
            path: `/agents/${agentId}/context`,
            body: chunk
          })
        ),
        Promise.resolve())
        .then(() => {
          const message = `Successfully added ${operations.length} operation(s) to the agent ${cfg.owner}/${cfg.project}/${agentId} context.`;
          debug(message);
          return { message };
        });
    },
    addAgentsContextOperations: function(agentsOperationsList) {
      testBulkInput(agentsOperationsList);
      agentsOperationsList.map(({ id, operations }) => {
        testId(id);
        testOperations(operations);
      });

      let chunkedData = [];
      let currentChunk = [];
      let currentChunkSize = 0;

      for (let agent of agentsOperationsList) {
        if (agent.operations && _.isArray(agent.operations)) {
          if (
            currentChunkSize + agent.operations.length > cfg.operationsChunksSize &&
            currentChunkSize.length
          ) {
            chunkedData.push(currentChunk);
            currentChunkSize = 0;
            currentChunk = [];
          }

          if (agent.operations.length > cfg.operationsChunksSize) {
            chunkedData.push([agent]);
            currentChunkSize = 0;
          }
          else {
            currentChunkSize += agent.operations.length;
            currentChunk.push(agent);
          }
        }
      }

      if (currentChunk.length) chunkedData.push(currentChunk);

      return Promise.all(
        chunkedData.map((chunk) => {
          if (chunk.length > 1) {
            return request({
              method: 'POST',
              path: '/bulk/context',
              body: chunk
            })
              .then(({ body }) => body);
          }
          else {
            return this.addAgentContextOperations(
              chunk[0].id,
              chunk[0].operations
            )
              .then(({ message }) => [
                { id: chunk[0].id, status: 201, message }
              ]);
          }
        })
      )
        .then(_.flattenDeep);
    },
    getAgentContextOperations: function(agentId, start = undefined, end = undefined) {
      if (_.isUndefined(agentId)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to get agent context operations with no agentId provided.'));
      }
      let startTimestamp;
      if (start) {
        startTimestamp = Time(start).timestamp;
        if (_.isUndefined(startTimestamp)) {
          return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to get agent context operations with an invalid \'start\' timestamp provided.'));
        }
      }
      let endTimestamp;
      if (end) {
        endTimestamp = Time(end).timestamp;
        if (_.isUndefined(endTimestamp)) {
          return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to get agent context operations with an invalid \'end\' timestamp provided.'));
        }
      }

      const requestFollowingPages = ({ operations, nextPageUrl }) => {
        if (!nextPageUrl) {
          return Promise.resolve(operations);
        }
        return request({ url: nextPageUrl }, this)
          .then(({ body, nextPageUrl }) => requestFollowingPages({
            operations: operations.concat(body),
            nextPageUrl
          }));
      };

      return request({
        method: 'GET',
        path: `/agents/${agentId}/context`,
        query: {
          start: startTimestamp,
          end: endTimestamp
        }
      })
        .then(({ body, nextPageUrl }) => requestFollowingPages({
          operations: body,
          nextPageUrl
        }));
    },
    getAgentStateHistory: function(agentId, start = undefined, end = undefined) {
      if (_.isUndefined(agentId)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to get agent state history with no agentId provided.'));
      }
      let startTimestamp;
      if (start) {
        startTimestamp = Time(start).timestamp;
        if (_.isUndefined(startTimestamp)) {
          return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to get agent state history with an invalid \'start\' timestamp provided.'));
        }
      }
      let endTimestamp;
      if (end) {
        endTimestamp = Time(end).timestamp;
        if (_.isUndefined(endTimestamp)) {
          return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to get agent state history with an invalid \'end\' timestamp provided.'));
        }
      }

      const requestFollowingPages = ({ stateHistory, nextPageUrl }) => {
        if (!nextPageUrl) {
          return Promise.resolve(stateHistory);
        }
        return request({ url: nextPageUrl })
          .then(({ body, nextPageUrl }) => requestFollowingPages({
            stateHistory: stateHistory.concat(body),
            nextPageUrl
          }));
      };

      return request({
        method: 'GET',
        path: `/agents/${agentId}/context/state/history`,
        query: {
          start: startTimestamp,
          end: endTimestamp
        }
      })
        .then(({ body, nextPageUrl }) => requestFollowingPages({
          stateHistory: body,
          nextPageUrl
        }));
    },
    getAgentInspectorUrl: function(agentId, t = undefined) {
      deprecation('client.getAgentInspectorUrl', 'client.getSharedAgentInspectorUrl');
      return this.getSharedAgentInspectorUrl(agentId, t);
    },
    getSharedAgentInspectorUrl: function(agentId, t = undefined) {
      return request({
        method: 'GET',
        path: `/agents/${agentId}/shared`
      })
        .then(({ body }) => {
          if (_.isUndefined(t)) {
            return body.shortUrl;
          }
          else {
            let posixTimestamp = Time(t).timestamp;
            return `${body.shortUrl}?t=${posixTimestamp}`;
          }
        });
    },
    deleteSharedAgentInspectorUrl: function(agentId) {
      return request({
        method: 'DELETE',
        path: `/agents/${agentId}/shared`
      })
        .then(() => {
          debug(`Delete shared inspector link for agent "${agentId}".`);
        });
    },
    getAgentDecisionTree: function(agentId, t = undefined, version = DEFAULT_DECISION_TREE_VERSION) {
      if (_.isUndefined(agentId)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to retrieve an agent decision tree with no agentId provided.'));
      }
      let posixTimestamp = Time(t).timestamp;
      if (_.isUndefined(posixTimestamp)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to retrieve an agent decision tree with an invalid timestamp provided.'));
      }

      const agentDecisionTreeRequest = () => request({
        method: 'GET',
        path: `/agents/${agentId}/decision/tree`,
        query: {
          t: posixTimestamp
        },
        headers: {
          'x-craft-ai-tree-version': version
        }
      })
        .then(({ body }) => body);

      if (!cfg.decisionTreeRetrievalTimeout) {
        // Don't retry
        return agentDecisionTreeRequest();
      }
      else {
        const start = Date.now();
        return Promise.race([
          agentDecisionTreeRequest()
            .catch((error) => {
              const requestDuration = Date.now() - start;
              const expectedRetryDuration = requestDuration + 2000; // Let's add some margin
              const timeoutBeforeRetrying = cfg.decisionTreeRetrievalTimeout - requestDuration - expectedRetryDuration;
              if (error instanceof CraftAiLongRequestTimeOutError && timeoutBeforeRetrying > 0) {
                // First timeout, let's retry once near the end of the set timeout
                return resolveAfterTimeout(timeoutBeforeRetrying)
                  .then(() => agentDecisionTreeRequest());
              }
              else {
                return Promise.reject(error);
              }
            }),
          resolveAfterTimeout(cfg.decisionTreeRetrievalTimeout)
            .then(() => {
              throw new CraftAiLongRequestTimeOutError();
            })
        ]);
      }
    },
    getAgentsDecisionTrees: function(agentsList) {
      testBulkInput(agentsList);
      agentsList.map(({ id }) => testId(id));

      return request({
        method: 'POST',
        path: '/bulk/decision_tree',
        body: agentsList
      })
        .then(({ body }) => body);
    },
    computeAgentDecision: function(agentId, t, ...contexts) {
      if (_.isUndefined(agentId)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to compute an agent decision with no agentId provided.'));
      }
      let posixTimestamp = Time(t).timestamp;
      if (_.isUndefined(posixTimestamp)) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to compute an agent decision with no or invalid timestamp provided.'));
      }
      if (_.isUndefined(contexts) || _.size(contexts) === 0) {
        return Promise.reject(new CraftAiBadRequestError('Bad Request, unable to compute an agent decision with no context provided.'));
      }

      return request({
        method: 'GET',
        path: `/agents/${agentId}/decision/tree`,
        query: {
          t: posixTimestamp
        }
      })
        .then(({ body }) => {
          let decision = decide(body, ...contexts);
          decision.timestamp = posixTimestamp;
          return decision;
        });
    }
  };

  return instance;
}
