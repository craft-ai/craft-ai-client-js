import _ from 'lodash';
import { CraftAiDecisionError } from './errors';
import semver from 'semver';

export default function parse(input) {
  const json = _.isObject(input) ? input : JSON.parse(input);
  if (!_.isObject(json) || _.isArray(input)) {
    throw new CraftAiDecisionError('Invalid decision tree format, the given json is not an object.');
  }
  if (_.isUndefined(json) || _.isUndefined(json._version)) {
    throw new CraftAiDecisionError('Invalid decision tree format, unable to find the version informations.');
  }

  const version = json._version;
  if (!semver.valid(version)) {
    throw new CraftAiDecisionError(`Invalid decision tree format, "${version}" is not a valid version.`);
  }
  else if (semver.satisfies(version, '>=1.0.0 || <3.0.0')) {
    return json;
  }
  else {
    throw new CraftAiDecisionError(`Invalid decision tree format, "${version}" is not a supported version.`);
  }
}
