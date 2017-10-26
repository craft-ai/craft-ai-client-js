import _ from 'lodash';
import Debug from 'debug';
import {
  CraftAiBadRequestError,
  CraftAiCredentialsError,
  CraftAiInternalError,
  CraftAiNetworkError,
  CraftAiLongRequestTimeOutError,
  CraftAiUnknownError
} from './errors';
import { IN_BROWSER } from './constants';
import { version } from '../package.json';

const fetch = !IN_BROWSER && typeof fetch === 'undefined'
  ? require('node-fetch')
  : window.fetch;

const debug = Debug('craft-ai:client');

const USER_AGENT = `craft-ai-client-js/${version} [${IN_BROWSER ? navigator.userAgent : `Node.js ${process.version}`}]`;

debug(`Client user agent set to '${USER_AGENT}'`);

function parseBody(req, resBody) {
  let resBodyUtf8;
  try {
    resBodyUtf8 = resBody.toString('utf-8');
  }
  catch (err) {
    debug(`Invalid response format from ${req.method} ${req.path}: ${resBody}`, err);
    throw new CraftAiInternalError(
      'Internal Error, the craft ai server responded in an invalid format.', {
        request: req
      }
    );
  }
  let resBodyJson;
  try {
    if (resBodyUtf8.length > 0) {
      resBodyJson = JSON.parse(resBodyUtf8);
    }
    else {
      resBodyJson = {};
    }
  }
  catch (err) {
    debug(`Invalid json response from ${req.method} ${req.path}: ${resBody}`, err);
    throw new CraftAiInternalError(
      'Internal Error, the craft ai server responded an invalid json document.', {
        more: resBodyUtf8,
        request: req
      }
    );
  }
  return resBodyJson;
}

function parseResponse(req, res, resBody) {
  switch (res.status) {
    case 200:
    case 201:
    case 204:
      return {
        body: parseBody(req, resBody),
        nextPageUrl: res.headers.get('x-craft-ai-next-page-url')
      };
    case 202:
      throw new CraftAiLongRequestTimeOutError({
        message: parseBody(req, resBody).message,
        request: req
      });
    case 401:
    case 403:
      throw new CraftAiCredentialsError({
        message: parseBody(req, resBody).message,
        request: req
      });
    case 400:
    case 404:
      throw new CraftAiBadRequestError({
        message: parseBody(req, resBody).message,
        request: req
      });
    case 413:
      throw new CraftAiBadRequestError({
        message: 'Given payload is too large',
        request: req
      });
    case 500:
      throw new CraftAiInternalError(parseBody(req, resBody).message, {
        request: req
      });
    case 504:
      throw new CraftAiInternalError({
        message: 'Response has timed out',
        request: req,
        status: res.status
      });
    default:
      throw new CraftAiUnknownError({
        more: parseBody(req, resBody).message,
        request: req,
        status: res.status
      });
  }
}

export default function request(req, cfg) {
  req = _.defaults(req || {}, {
    method: 'GET',
    path: '',
    body: undefined,
    query: {},
    headers: {}
  });

  req.url = req.url || `${cfg.url}/api/v1/${cfg.owner}/${cfg.project}${req.path}`;
  const queryStr = _(req.query)
    .map((value, key) => ([key, value]))
    .filter(([key, value]) => !_.isUndefined(value))
    .map((keyVal) => keyVal.join('='))
    .join('&');
  if (queryStr.length > 0) {
    req.url += `?${queryStr}`;
  }
  req.headers['Authorization'] = `Bearer ${cfg.token}`;
  req.headers['Content-Type'] = 'application/json; charset=utf-8';
  req.headers['Accept'] = 'application/json';
  if (!IN_BROWSER) {
    // Don't set the user agent in browsers it can cause CORS issues
    // e.g. Safari v10.1.2 (12603.3.8)
    req.headers['User-Agent'] = USER_AGENT;
  }


  req.body = req.body && JSON.stringify(req.body);

  return fetch(req.url, req)
    .catch((err) => {
      debug(`Network error while executing ${req.method} ${req.path}`, err);
      return Promise.reject(new CraftAiNetworkError({
        more: err.message
      }));
    })
    .then((res) => res.text()
      .catch((err) => {
        debug(`Invalid response from ${req.method} ${req.path}`, err);

        throw new CraftAiInternalError('Internal Error, the craft ai server responded an invalid response, see err.more for details.', {
          request: req,
          more: err.message
        });
      })
      .then((resBody) => parseResponse(req, res, resBody))
    );
}
