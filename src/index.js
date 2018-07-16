import createClient from './client';
import * as interpreter from './interpreter';
import DEFAULT from './defaults';
import Time from './time';
import * as errors from './errors';
import * as Properties from './properties';
import { deprecation } from './constants';

export default createClient;

function decide(tree, ...args) {
  deprecation('decide', 'interpreter.decide');
  return interpreter.decide(tree, ...args);
}

createClient.decide = decide;
createClient.DEFAULT = DEFAULT;
createClient.errors = errors;
createClient.interpreter = interpreter;
createClient.Time = Time;
createClient.Properties = Properties;

export {
  createClient,
  decide,
  DEFAULT,
  errors,
  interpreter,
  Time,
  Properties
};
