import _ from 'lodash';
import semver from 'semver';

export default function parse( input ) {
  const json = _.isObject(input) ? input : JSON.parse(input);
  if ( !_.isObject( json ) ) {
    throw new Error('Invalid decision tree format, the given json is not an array.');
  }
  if ( _.isUndefined( json[0] ) || _.isUndefined( json[0]._version )) {
    throw new Error('Invalid decision tree format, unable to find the version informations.');
  }

  const version = json[0]._version;
  if (!semver.valid(version)) {
    throw new Error(`Invalid decision tree format, "${version}" is not a valid version.`);
  }
  else if (semver.satisfies(version, '1.0.0')) {
    return json;
  }
  else {
    throw new Error(`Invalid decision tree format, "${version}" is not a supported version.`);
  }
}
