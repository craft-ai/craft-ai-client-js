import createClient from './client';
import * as interpreter from './interpreter';
import DEFAULT from './defaults';
import Time from './time';
import * as errors from './errors';
import * as Properties from './properties';

export default createClient;

function decide(tree, ...args) {
  console.warn('WARNING: \'decide\' method of craft ai client is deprecated. It will be removed in the future, use \'interpreter.decide\' instead. Refer to https://beta.craft.ai/doc/js.');
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
