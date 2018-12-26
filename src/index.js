import createClient from './client';
import DEFAULT from './defaults';
import { deprecation } from './constants';
import Time from './time';
import * as errors from './errors';
import * as interpreter from './interpreter';
import * as Properties from './properties';

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
